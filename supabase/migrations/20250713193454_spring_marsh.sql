/*
  # Add INSERT policy for orders table

  1. Security
    - Add policy for authenticated users to insert orders
    - Allow all authenticated users to create new orders
*/

CREATE POLICY "Authenticated users can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);