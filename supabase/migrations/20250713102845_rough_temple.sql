/*
  # Create stores table

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `stores` table
    - Add policies for authenticated users to read stores
    - Add policies for admins to manage stores
*/

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read stores
CREATE POLICY "Authenticated users can read stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage stores
CREATE POLICY "Admins can manage stores"
  ON stores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default stores for HP World
INSERT INTO stores (name, location) VALUES
  ('HP World Store 1', 'Main Branch - Delhi'),
  ('HP World Store 2', 'Secondary Branch - Mumbai')
ON CONFLICT DO NOTHING;