/*
  # Create Invoice Management System

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique)
      - `customer_name` (text, required)
      - `customer_company` (text, optional)
      - `customer_address` (text, optional)
      - `customer_phone` (text, optional)
      - `customer_email` (text, required)
      - `invoice_date` (date, required)
      - `due_date` (date, required)
      - `subtotal` (numeric, required)
      - `tax_rate` (numeric, required)
      - `tax_amount` (numeric, required)
      - `total_amount` (numeric, required)
      - `status` (text, required, check constraint)
      - `payment_method` (text, optional)
      - `notes` (text, optional)
      - `created_at` (timestamp)

    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key)
      - `description` (text, required)
      - `quantity` (integer, required)
      - `unit_price` (numeric, required)
      - `total` (numeric, required)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage invoices
    - Add policies for admins to have full access

  3. Relationships
    - Foreign key from invoice_items.invoice_id to invoices.id with CASCADE delete
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_company text,
  customer_address text,
  customer_phone text,
  customer_email text NOT NULL,
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0
);

-- Add constraints
ALTER TABLE invoices 
ADD CONSTRAINT IF NOT EXISTS invoices_status_check 
CHECK (status IN ('draft', 'sent', 'paid', 'overdue'));

-- Add foreign key relationship
ALTER TABLE invoice_items 
ADD CONSTRAINT IF NOT EXISTS invoice_items_invoice_id_fkey 
FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Authenticated users can read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create policies for invoice_items
CREATE POLICY "Authenticated users can read invoice_items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert invoice_items"
  ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoice_items"
  ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all invoice_items"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );