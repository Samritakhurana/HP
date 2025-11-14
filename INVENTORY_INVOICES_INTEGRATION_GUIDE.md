# Inventory-Invoices Integration Guide

## Overview

This guide documents the changes made to integrate the Inventory and Invoices sections, allowing automatic inventory deduction when products are sold through invoices.

## Changes Made

### 1. Database Migration

**File:** `supabase/migrations/20250114000000_add_product_id_to_invoice_items.sql`

Added a `product_id` column to the `invoice_items` table to link invoice items to inventory products.

```sql
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);
```

**To apply this migration:**

1. If using Supabase CLI locally:

   ```bash
   supabase db reset
   ```

   OR

   ```bash
   supabase migration up
   ```

2. If using Supabase Dashboard:
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"
   - Copy and paste the SQL from the migration file
   - Click "Run"

### 2. Type Definitions Update

**File:** `src/types/index.ts`

Updated the `InvoiceItem` interface to include the optional `product_id` field:

```typescript
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string; // NEW: Links to products table
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}
```

### 3. Products Hook Enhancement

**File:** `src/hooks/useProducts.ts`

Added `updateProductQuantity` method to handle inventory deduction:

```typescript
const updateProductQuantity = async (id: string, quantitySold: number) => {
  // Checks stock availability
  // Updates quantity
  // Logs the activity
  // Returns success/error
};
```

**Key Features:**

- Validates stock availability before update
- Prevents negative inventory
- Logs all quantity changes
- Provides detailed error messages

### 4. Invoices Hook Enhancement

**File:** `src/hooks/useInvoices.ts`

Updated `addInvoice` method to automatically deduct inventory:

```typescript
const addInvoice = async (invoiceData) => {
  // 1. Check inventory availability for all items
  // 2. Create invoice
  // 3. Create invoice items
  // 4. Update product quantities
  // 5. Log activities
};
```

**Key Features:**

- Pre-validates all items before processing
- Prevents overselling (checks stock before creating invoice)
- Atomic operation (fails entirely if any item is out of stock)
- Detailed activity logging for audit trail

### 5. Invoices UI Update

**File:** `src/pages/Invoices.tsx`

Transformed the invoice item input from text description to product dropdown:

**Before:**

- Text input for description
- Manual price entry
- No inventory awareness

**After:**

- Dropdown showing all available products
- Displays product name, price, and current stock
- Auto-fills price when product is selected
- Limits quantity to available stock
- Shows real-time stock information

**New Form State:**

```typescript
items: [
  {
    product_id: "", // NEW: Product selection
    description: "", // Auto-filled from product
    quantity: 1,
    unit_price: 0, // Auto-filled from product
  },
];
```

**New Handlers:**

- `handleProductSelect`: Automatically fills description and price when product is selected
- Enhanced validation: Prevents selecting more quantity than available

## How It Works

### User Flow:

1. **User navigates to Invoices page** and clicks "Create Invoice"

2. **User fills customer information**

3. **User selects a product from dropdown:**

   - Dropdown shows: "Product Name - ₹Price (Stock: X)"
   - On selection, description and unit price are auto-filled

4. **User enters quantity:**

   - Input validates against available stock
   - Shows error if quantity exceeds stock

5. **User can add multiple items**

6. **User submits the invoice:**

   - System validates all items have sufficient stock
   - If validation passes:
     - Invoice is created
     - Invoice items are saved with product_id
     - Inventory quantities are reduced
     - Activity logs are created
   - If validation fails:
     - Clear error message is shown
     - No changes are made to database

7. **Inventory is automatically updated:**
   - Product quantities are reduced
   - Activity logs show the transaction
   - Low stock alerts trigger if thresholds are reached

## Testing the Integration

### Test Case 1: Successful Sale

1. Go to Inventory
2. Note a product's quantity (e.g., "HP Laptop" has 50 units)
3. Go to Invoices
4. Create new invoice
5. Select "HP Laptop" from dropdown
6. Enter quantity: 5
7. Complete and submit invoice
8. Go back to Inventory
9. Verify "HP Laptop" now shows 45 units

### Test Case 2: Insufficient Stock

1. Find a product with low stock (e.g., 2 units)
2. Try to create an invoice with quantity: 5
3. Verify error message appears: "Insufficient stock. Available: 2, Requested: 5"
4. Verify no invoice is created
5. Verify inventory remains unchanged

### Test Case 3: Multiple Items

1. Create invoice with multiple products:
   - Product A: 3 units (stock: 10)
   - Product B: 2 units (stock: 5)
2. Submit invoice
3. Verify both products' inventories are reduced correctly
4. Verify activity logs show both transactions

### Test Case 4: Stock Visibility

1. In invoice creation form
2. Select each product from dropdown
3. Verify current stock is displayed
4. Verify quantity input has appropriate max value

## Activity Logging

All inventory changes are logged with:

- User who performed the action
- Action type: "Update Inventory"
- Details: "Sold X units of Product Y via invoice INV-XXX"
- Timestamp

This provides a complete audit trail for inventory changes.

## Error Handling

The system handles these scenarios:

1. **Product not found**: Clear error message
2. **Insufficient stock**: Shows available vs requested
3. **Database errors**: Rolled back, no partial updates
4. **Network errors**: Proper error messages

## Benefits of This Integration

1. **Accuracy**: No manual inventory updates needed
2. **Prevention**: Cannot oversell inventory
3. **Transparency**: Complete audit trail
4. **User-Friendly**: Dropdown shows real-time stock
5. **Efficiency**: Automatic price filling
6. **Safety**: Atomic transactions prevent data inconsistency
7. **Alerts**: Low stock warnings trigger automatically

## Future Enhancements (Optional)

Potential improvements you could add:

1. **Batch Upload**: Import multiple products for invoice
2. **Product Search**: Search bar in product dropdown for large inventories
3. **Reserved Stock**: Hold stock when draft invoice is created
4. **Stock History**: Show product's sales history
5. **Predictive Alerts**: Predict stockouts based on sales velocity
6. **Return Handling**: Add stock back when invoice is cancelled
7. **Partial Payments**: Track payment status separately from stock
8. **Multi-location**: Support for multiple warehouse locations

## Rollback Instructions

If you need to revert these changes:

1. **Remove the migration:**

   ```sql
   ALTER TABLE invoice_items DROP COLUMN IF EXISTS product_id;
   ```

2. **Revert the code files** to their previous versions using git:
   ```bash
   git checkout HEAD~1 -- src/types/index.ts
   git checkout HEAD~1 -- src/hooks/useProducts.ts
   git checkout HEAD~1 -- src/hooks/useInvoices.ts
   git checkout HEAD~1 -- src/pages/Invoices.tsx
   ```

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify migration was applied successfully
3. Check Supabase logs for database errors
4. Ensure products exist in inventory before testing
5. Verify user authentication is working

## Summary

✅ Products are now linked to invoice items via `product_id`  
✅ Product dropdown replaces text description input  
✅ Auto-fill price and description from selected product  
✅ Real-time stock visibility in dropdown  
✅ Automatic inventory deduction on invoice creation  
✅ Stock validation prevents overselling  
✅ Complete activity logging for audit trail  
✅ Error handling for edge cases

Your inventory and invoices are now fully integrated!
