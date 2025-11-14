import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Invoice } from "../types";

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      // First, fetch all invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (invoicesError) throw invoicesError;

      // Then, fetch all invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*");

      if (itemsError) throw itemsError;

      // Manually combine the data
      const invoicesWithItems = (invoicesData || []).map((invoice) => ({
        ...invoice,
        items: (itemsData || []).filter(
          (item) => item.invoice_id === invoice.id
        ),
      }));

      setInvoices(invoicesWithItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("invoice_number")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching last invoice:", error);
      return "INV-001";
    }

    if (!data || data.length === 0) {
      return "INV-001";
    }

    const lastNumber = data[0].invoice_number;
    const numberPart = parseInt(lastNumber.split("-")[1]) || 0;
    const newNumber = numberPart + 1;
    return `INV-${newNumber.toString().padStart(3, "0")}`;
  };

  const addInvoice = async (
    invoiceData: Omit<Invoice, "id" | "created_at" | "items"> & {
      items: Omit<Invoice["items"][0], "id" | "invoice_id">[];
    }
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First, check inventory availability for all items with product_id
      const inventoryChecks = await Promise.all(
        invoiceData.items
          .filter((item) => item.product_id)
          .map(async (item) => {
            console.log("Checking inventory for product_id:", item.product_id);
            const { data: product, error } = await supabase
              .from("products")
              .select("quantity, name")
              .eq("id", item.product_id)
              .single();

            if (error) throw error;
            if (!product) throw new Error(`Product not found`);

            if (product.quantity < item.quantity) {
              throw new Error(
                `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
              );
            }

            console.log(
              `✓ Stock check passed for ${product.name}: Available=${product.quantity}, Requested=${item.quantity}`
            );

            return {
              product_id: item.product_id,
              quantity: item.quantity,
              name: product.name,
            };
          })
      );

      console.log(
        "All inventory checks passed. Items to update:",
        inventoryChecks
      );

      // Insert invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceData.invoice_number,
          customer_name: invoiceData.customer_name,
          customer_company: invoiceData.customer_company,
          customer_address: invoiceData.customer_address,
          customer_phone: invoiceData.customer_phone,
          customer_email: invoiceData.customer_email,
          invoice_date: invoiceData.invoice_date,
          due_date: invoiceData.due_date,
          subtotal: invoiceData.subtotal,
          tax_rate: invoiceData.tax_rate,
          tax_amount: invoiceData.tax_amount,
          total_amount: invoiceData.total_amount,
          status: invoiceData.status,
          payment_method: invoiceData.payment_method,
          notes: invoiceData.notes,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert invoice items
      if (invoiceData.items.length > 0) {
        const invoiceItems = invoiceData.items.map((item) => ({
          ...item,
          invoice_id: invoice.id,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      // Update inventory quantities for items with product_id
      console.log("Starting inventory updates...");
      for (const check of inventoryChecks) {
        const { data: product } = await supabase
          .from("products")
          .select("quantity")
          .eq("id", check.product_id)
          .single();

        if (product) {
          const newQuantity = product.quantity - check.quantity;
          console.log(
            `Updating ${check.name}: ${product.quantity} - ${check.quantity} = ${newQuantity}`
          );

          const { error: updateError } = await supabase
            .from("products")
            .update({ quantity: newQuantity })
            .eq("id", check.product_id);

          if (updateError) {
            console.error("Error updating inventory:", updateError);
            throw updateError;
          }

          console.log(
            `✓ Successfully updated ${check.name} inventory to ${newQuantity}`
          );

          // Log inventory update
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            action: "Update Inventory",
            details: `Sold ${check.quantity} units of ${check.name} via invoice ${invoiceData.invoice_number}`,
          });
        }
      }

      console.log("✓ All inventory updates completed successfully");

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "Create Invoice",
        details: `Created invoice ${invoiceData.invoice_number} for ${invoiceData.customer_name}`,
      });

      await fetchInvoices();
      return { success: true, invoice };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create invoice",
      };
    }
  };

  const updateInvoiceStatus = async (id: string, status: Invoice["status"]) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "Update Invoice Status",
        details: `Updated invoice status to ${status}`,
      });

      await fetchInvoices();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to update invoice status",
      };
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    addInvoice,
    updateInvoiceStatus,
    generateInvoiceNumber,
    refetch: fetchInvoices,
  };
};
