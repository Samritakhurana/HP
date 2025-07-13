/*
  # Add comprehensive RLS policies for all tables

  1. Security
    - Ensure all tables have proper INSERT, UPDATE, DELETE policies
    - Add admin override policies where needed
    - Fix any missing policies
*/

-- Products table - Add UPDATE and DELETE policies
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Orders table - Add UPDATE and DELETE policies
CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Tasks table - Add UPDATE and DELETE policies
CREATE POLICY "Users can update assigned tasks" ON tasks
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Task assigners can update their tasks" ON tasks
  FOR UPDATE TO authenticated
  USING (assigned_by = auth.uid())
  WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Admins can update all tasks" ON tasks
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Task assigners can delete their tasks" ON tasks
  FOR DELETE TO authenticated
  USING (assigned_by = auth.uid());

CREATE POLICY "Admins can delete all tasks" ON tasks
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Messages table - Add DELETE policy
CREATE POLICY "Users can delete their sent messages" ON messages
  FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- Payroll table - Add UPDATE and DELETE policies
CREATE POLICY "Admins can update payroll" ON payroll
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Admins can delete payroll" ON payroll
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Activity logs - Add UPDATE and DELETE policies (admin only)
CREATE POLICY "Admins can update activity logs" ON activity_logs
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Admins can delete activity logs" ON activity_logs
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Order items - Add DELETE policy
CREATE POLICY "Admins can delete order_items" ON order_items
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Attendance - Add DELETE policy (admin only)
CREATE POLICY "Admins can delete attendance" ON attendance
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));