/*
  # Add INSERT policy for products table

  1. Security
    - Add policy for authenticated users to insert products
    - This allows users to add new products to the inventory system
*/

-- Add policy to allow authenticated users to insert products
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);