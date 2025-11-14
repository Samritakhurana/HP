import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Product } from "../types";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchProducts = async (isLoadMore = false, limit = 50) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = isLoadMore ? offset : 0;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (error) throw error;

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...(data || [])]);
      } else {
        setProducts(data || []);
      }

      setHasMore((data || []).length === limit);
      setOffset(currentOffset + (data || []).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(true);
    }
  };

  const addProduct = async (
    productData: Omit<Product, "id" | "created_at">
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("products").insert(productData);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "Add Product",
        details: `Added product: ${productData.name}`,
      });

      await fetchProducts(false);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to add product",
      };
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "Update Product",
        details: `Updated product: ${productData.name || "Unknown"}`,
      });

      await fetchProducts(false);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update product",
      };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get product name for logging
      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "Delete Product",
        details: `Deleted product: ${product?.name || "Unknown"}`,
      });

      await fetchProducts(false);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete product",
      };
    }
  };

  const updateProductQuantity = async (id: string, quantitySold: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get current product
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");

      // Check if there's enough stock
      if (product.quantity < quantitySold) {
        throw new Error(
          `Insufficient stock. Available: ${product.quantity}, Requested: ${quantitySold}`
        );
      }

      // Update quantity
      const newQuantity = product.quantity - quantitySold;
      const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "Update Product Quantity",
        details: `Sold ${quantitySold} units of ${product.name}. New quantity: ${newQuantity}`,
      });

      await fetchProducts(false);
      return { success: true, newQuantity };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to update product quantity",
      };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductQuantity,
    refetch: () => fetchProducts(false),
  };
};
