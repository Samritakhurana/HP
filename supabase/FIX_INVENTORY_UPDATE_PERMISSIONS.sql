-- ================================================
-- FIX: Enable Inventory Updates from Invoices
-- ================================================
-- Run this SQL in Supabase SQL Editor
-- This will allow the system to update product quantities

-- Step 1: Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON products;

-- Step 3: Create a permissive UPDATE policy
-- This allows authenticated users to update product quantities
CREATE POLICY "Allow authenticated users to update products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 4: Verify the policy was created successfully
SELECT 
  policyname AS "Policy Name",
  cmd AS "Command",
  roles AS "Roles"
FROM pg_policies 
WHERE tablename = 'products' AND cmd = 'UPDATE';

-- Expected Result: You should see the policy listed
-- Policy Name: "Allow authenticated users to update products"
-- Command: UPDATE
-- Roles: {authenticated}

-- ================================================
-- OPTIONAL: Create complete set of policies
-- ================================================
-- Uncomment the lines below if you want to ensure all operations are allowed

-- Allow SELECT (read)
-- DROP POLICY IF EXISTS "Allow authenticated users to read products" ON products;
-- CREATE POLICY "Allow authenticated users to read products"
-- ON products FOR SELECT TO authenticated USING (true);

-- Allow INSERT (create)
-- DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
-- CREATE POLICY "Allow authenticated users to insert products"
-- ON products FOR INSERT TO authenticated WITH CHECK (true);

-- Allow DELETE (remove)
-- DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;
-- CREATE POLICY "Allow authenticated users to delete products"
-- ON products FOR DELETE TO authenticated USING (true);

-- ================================================
-- VERIFICATION: Check all policies
-- ================================================
-- Run this to see all policies on the products table
SELECT 
  schemaname AS "Schema",
  tablename AS "Table",
  policyname AS "Policy Name",
  cmd AS "Operation",
  roles AS "Allowed Roles"
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd;

-- ================================================
-- SUCCESS!
-- ================================================
-- After running this, your inventory should update automatically
-- when you create invoices.
--
-- Test by:
-- 1. Note a product's quantity in Inventory
-- 2. Create an invoice selling that product
-- 3. Check Inventory - quantity should be reduced
-- ================================================
