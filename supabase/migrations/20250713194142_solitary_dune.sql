/*
  # Add INSERT policy for payroll table

  1. Security
    - Add policy for admins to insert payroll records
    - Only users with 'admin' role can process payroll
*/

CREATE POLICY "Admins can insert payroll"
  ON payroll
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );