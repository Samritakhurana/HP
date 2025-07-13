/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `sku` (text, unique)
      - `quantity` (integer)
      - `price` (decimal)
      - `description` (text, optional)
      - `low_stock_threshold` (integer, default 5)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to read products
    - Add policies for admins to manage products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  sku text UNIQUE NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  price decimal(10,2) NOT NULL,
  description text,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read products
CREATE POLICY "Authenticated users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage products
CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample HP products
INSERT INTO products (name, category, sku, quantity, price, description, low_stock_threshold) VALUES
  ('HP Laptop Elite 650', 'Laptops', 'HP-650-BLK', 2, 75000.00, 'High-performance business laptop', 5),
  ('HP Printer LaserJet Pro', 'Printers', 'HP-LJ-PRO', 8, 25000.00, 'Professional laser printer', 3),
  ('HP Monitor 24"', 'Monitors', 'HP-MON-24', 12, 18000.00, '24-inch LED monitor', 5),
  ('HP Keyboard Wireless', 'Accessories', 'HP-KB-WL', 25, 2500.00, 'Wireless keyboard', 10),
  ('HP Mouse Optical', 'Accessories', 'HP-MS-OPT', 4, 1200.00, 'Optical mouse', 10),
  ('HP Desktop Pro Tower', 'Desktops', 'HP-DT-PRO', 1, 45000.00, 'Professional desktop computer', 3)
ON CONFLICT (sku) DO NOTHING;