# 🔧 TROUBLESHOOTING: Inventory Not Updating

## 🎯 Issue: Products Not Being Subtracted from Inventory

You're experiencing this issue because of **Supabase Row Level Security (RLS) policies**. The code is correct, but the database is blocking the UPDATE operation.

---

## 🔍 Step 1: Check Browser Console

1. Open your website
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Create a test invoice
5. Look for these messages:

### ✅ If you see these - Code is Running:

```
Creating invoice with data: {...}
Checking inventory for product_id: xxx
✓ Stock check passed for HP Laptop: Available=50, Requested=5
Starting inventory updates...
Updating HP Laptop: 50 - 5 = 45
```

### ❌ If you see this ERROR:

```
Error updating inventory: {
  code: "42501",
  message: "new row violates row-level security policy"
}
```

OR

```
Error updating inventory: {
  message: "permission denied for table products"
}
```

**→ This confirms it's a PERMISSION ISSUE in Supabase!**

---

## 🛠️ Step 2: Fix Supabase RLS Policies

You need to update the Row Level Security policies in Supabase to allow product updates.

### **Option A: Using Supabase Dashboard (Recommended)**

1. **Go to your Supabase Dashboard**
2. Click on **"Authentication"** → **"Policies"** (or go to **"Database"** → **"Policies"**)
3. Find the **`products`** table
4. Look for existing policies

#### **Current Policies (Likely):**

- ✅ SELECT (read) - Enabled for authenticated users
- ❌ UPDATE (write) - **MISSING or TOO RESTRICTIVE**

#### **What You Need to Add:**

Click **"New Policy"** for the `products` table and create this:

```sql
-- Policy Name: Allow authenticated users to update products
-- Table: products
-- Operation: UPDATE
-- Policy:

CREATE POLICY "Allow authenticated users to update products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

### **Option B: Using SQL Editor (Alternative)**

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL:

```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- If no UPDATE policy exists, create one:
CREATE POLICY "Allow authenticated users to update products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Or if you want to be more restrictive (only admins can update):
CREATE POLICY "Allow admins to update products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## 🔍 Step 3: Verify RLS Policies

After adding the policy, verify it's active:

### **Check via Dashboard:**

1. Go to **Database** → **Tables** → **products**
2. Click on **"RLS Policies"** tab
3. You should see:
   - ✅ **SELECT policy** (read)
   - ✅ **INSERT policy** (create)
   - ✅ **UPDATE policy** (update) ← **THIS IS CRITICAL!**
   - ✅ **DELETE policy** (delete)

### **Check via SQL:**

```sql
-- Run this in SQL Editor to see all policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';
```

---

## 🧪 Step 4: Test Again

1. **Clear browser cache**: Press `Ctrl + Shift + R`
2. **Open Console**: Press `F12`
3. **Note a product quantity** in Inventory (e.g., 50 units)
4. **Create an invoice** selling 5 units
5. **Check Console** - you should now see:
   ```
   ✓ Successfully updated HP Laptop inventory to 45
   ✓ All inventory updates completed successfully
   ```
6. **Check Inventory page** - quantity should be 45

---

## 🎯 Quick Fix SQL (Copy & Paste)

If you just want a quick fix, run this in Supabase SQL Editor:

```sql
-- Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive UPDATE policy if any
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;

-- Create permissive UPDATE policy
CREATE POLICY "Allow authenticated users to update products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policy was created
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'products' AND cmd = 'UPDATE';
```

---

## 🔐 Understanding RLS Policies

### **What is RLS?**

Row Level Security is Supabase's way of controlling who can access/modify data.

### **Why This Happens:**

When you create tables in Supabase, RLS is often enabled by default with **very restrictive policies** that only allow reading data, not updating.

### **The Fix:**

We need to explicitly allow authenticated users to UPDATE the products table.

### **Security Consideration:**

The policy `USING (true)` allows all authenticated users to update products. If you want only admins to update inventory, use the admin-only policy shown above.

---

## 📊 Complete RLS Policies for Products Table

Here's a complete set of policies for the products table:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 1. Allow everyone to READ products (for displaying in dropdowns)
CREATE POLICY "Allow authenticated users to read products"
ON products
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow authenticated users to INSERT products
CREATE POLICY "Allow authenticated users to insert products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Allow authenticated users to UPDATE products (FOR INVENTORY DEDUCTION)
CREATE POLICY "Allow authenticated users to update products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow authenticated users to DELETE products
CREATE POLICY "Allow authenticated users to delete products"
ON products
FOR DELETE
TO authenticated
USING (true);
```

---

## 🚨 Alternative Issue: invoice_items Table

If the above doesn't fix it, the issue might also be with the `invoice_items` table not having the `product_id` column. Verify:

```sql
-- Check if product_id column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'invoice_items';

-- If product_id is missing, add it:
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;
```

---

## 🎯 Expected Console Output (When Working)

```javascript
Creating invoice with data: {
  items: [
    {
      product_id: "123-456-789",  ← Should NOT be undefined
      description: "HP Laptop",
      quantity: 5,
      unit_price: 45000
    }
  ]
}

Checking inventory for product_id: 123-456-789
✓ Stock check passed for HP Laptop: Available=50, Requested=5
All inventory checks passed. Items to update: [{...}]
Starting inventory updates...
Updating HP Laptop: 50 - 5 = 45
✓ Successfully updated HP Laptop inventory to 45  ← SUCCESS!
✓ All inventory updates completed successfully
```

---

## 📋 Checklist

After applying the fix, verify:

- [ ] SQL UPDATE policy created in Supabase
- [ ] Browser console shows no permission errors
- [ ] Console shows "✓ Successfully updated [Product] inventory"
- [ ] Inventory page shows reduced quantities
- [ ] No errors in Supabase logs

---

## 💡 Pro Tip: Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **"Logs"** → **"API Logs"**
3. Create a test invoice
4. Look for any errors related to products table
5. Share the error with me if you see any

---

## 🆘 Still Not Working?

If it's still not working after applying the RLS policy, provide me with:

1. **Screenshot of Supabase RLS Policies** for products table
2. **Console output** when creating invoice (F12 → Console)
3. **Any error messages** from Supabase logs
4. **Result of this SQL query:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'products';
   ```

---

## ✅ Success Indicator

**You'll know it's fixed when:**

1. Console shows: `✓ Successfully updated [Product] inventory to [New Quantity]`
2. Inventory page shows reduced quantities
3. No permission errors in console

---

## 🎉 Summary

**The Problem:** Supabase RLS blocking UPDATE operations on products table

**The Solution:** Add UPDATE policy to allow authenticated users to update products

**The Fix:** Run the SQL commands above in Supabase SQL Editor

**The Test:** Create an invoice and check if inventory reduces

---

**Follow Step 2 above to fix the issue in Supabase!** 🚀
