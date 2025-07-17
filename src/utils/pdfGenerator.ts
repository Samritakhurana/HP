import jsPDF from 'jspdf';
import { Invoice } from '../types';

export const generateInvoicePDF = (invoice: Invoice) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(24);
  doc.setTextColor(0, 150, 214); // HP Blue
  doc.text('C-Destination', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('C Destination', 20, 40);
  doc.text('Retail & Distribution', 20, 48);
  
  // Invoice Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 150, 30);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoice_number}`, 150, 45);
  doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 150, 52);
  doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 150, 59);
  
  // Customer Information
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Bill To:', 20, 70);
  
  doc.setFontSize(10);
  let yPos = 80;
  doc.text(invoice.customer_name, 20, yPos);
  
  if (invoice.customer_company) {
    yPos += 7;
    doc.text(invoice.customer_company, 20, yPos);
  }
  
  if (invoice.customer_address) {
    yPos += 7;
    const addressLines = invoice.customer_address.split('\n');
    addressLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 7;
    });
  }
  
  if (invoice.customer_phone) {
    yPos += 7;
    doc.text(`Phone: ${invoice.customer_phone}`, 20, yPos);
  }
  
  yPos += 7;
  doc.text(`Email: ${invoice.customer_email}`, 20, yPos);
  
  // Items Table
  const tableStartY = Math.max(yPos + 20, 120);
  
  // Table Headers
  doc.setFillColor(240, 240, 240);
  doc.rect(20, tableStartY, 170, 10, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Description', 25, tableStartY + 7);
  doc.text('Qty', 120, tableStartY + 7);
  doc.text('Unit Price', 140, tableStartY + 7);
  doc.text('Total', 170, tableStartY + 7);
  
  // Table Items
  let currentY = tableStartY + 15;
  invoice.items.forEach((item, index) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 30;
    }
    
    doc.text(item.description, 25, currentY);
    doc.text(item.quantity.toString(), 120, currentY);
    doc.text(`₹${item.unit_price.toFixed(2)}`, 140, currentY);
    doc.text(`₹${item.total.toFixed(2)}`, 170, currentY);
    
    currentY += 10;
  });
  
  // Totals
  const totalsStartY = currentY + 10;
  
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, totalsStartY);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, 170, totalsStartY);
  
  if (invoice.tax_amount > 0) {
    doc.text(`Tax (${invoice.tax_rate}%):`, 140, totalsStartY + 10);
    doc.text(`₹${invoice.tax_amount.toFixed(2)}`, 170, totalsStartY + 10);
  }
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  const totalY = invoice.tax_amount > 0 ? totalsStartY + 20 : totalsStartY + 10;
  doc.text('Total:', 140, totalY);
  doc.text(`₹${invoice.total_amount.toFixed(2)}`, 170, totalY);
  
  // Payment Information
  const paymentY = totalY + 20;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Payment Information:', 20, paymentY);
  
  if (invoice.payment_method) {
    doc.text(`Payment Method: ${invoice.payment_method}`, 20, paymentY + 10);
  }
  
  doc.text('Bank Transfer: C-Destination Business Account', 20, paymentY + 20);
  doc.text('UPI: hpworld@upi', 20, paymentY + 30);
  doc.text('Contact: support@hpworld.com', 20, paymentY + 40);
  
  // Notes
  if (invoice.notes) {
    doc.text('Notes:', 20, paymentY + 55);
    const noteLines = invoice.notes.split('\n');
    noteLines.forEach((line, index) => {
      doc.text(line, 20, paymentY + 65 + (index * 7));
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 20, 280);
  doc.text('C-Destination makes distribution simple', 20, 287);
  
  // Save the PDF
  doc.save(`Invoice_${invoice.invoice_number}.pdf`);
};