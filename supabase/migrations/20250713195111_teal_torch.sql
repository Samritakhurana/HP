/*
  # Fix order_items table RLS policies

  1. Security
    - Add missing INSERT policy for order items
    - Allow authenticated users to insert order items
    - Maintain existing read policies
*/

-- Add INSERT policy for order items
CREATE POLICY "Authenticated users can insert order_items" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for order items (for admins)
CREATE POLICY "Admins can update order_items" ON order_items
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));