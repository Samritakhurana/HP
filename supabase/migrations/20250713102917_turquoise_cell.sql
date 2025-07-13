/*
  # Create payroll table

  1. New Tables
    - `payroll`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `month` (text)
      - `year` (integer)
      - `base_salary` (decimal)
      - `bonus` (decimal, default 0)
      - `total_salary` (decimal)
      - `days_worked` (integer)
      - `total_days` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `payroll` table
    - Add policies for users to read their own payroll
    - Add policies for admins to manage all payroll
*/

CREATE TABLE IF NOT EXISTS payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month text NOT NULL,
  year integer NOT NULL,
  base_salary decimal(10,2) NOT NULL DEFAULT 0,
  bonus decimal(10,2) NOT NULL DEFAULT 0,
  total_salary decimal(10,2) NOT NULL DEFAULT 0,
  days_worked integer NOT NULL DEFAULT 0,
  total_days integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Users can read their own payroll
CREATE POLICY "Users can read own payroll"
  ON payroll
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all payroll
CREATE POLICY "Admins can read all payroll"
  ON payroll
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can manage payroll
CREATE POLICY "Admins can manage payroll"
  ON payroll
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );