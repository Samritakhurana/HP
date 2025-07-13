/*
  # Fix RLS Policies - Remove Infinite Recursion

  This migration fixes the infinite recursion error in RLS policies by:
  1. Dropping existing problematic policies
  2. Creating simplified, non-recursive policies
  3. Ensuring no circular dependencies between tables

  ## Changes Made
  - Simplified user policies to avoid self-referencing
  - Fixed admin role checks to prevent recursion
  - Ensured all policies are efficient and non-circular
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

DROP POLICY IF EXISTS "Authenticated users can read stores" ON stores;
DROP POLICY IF EXISTS "Admins can manage stores" ON stores;

DROP POLICY IF EXISTS "Users can read own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can update own attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can read all attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can manage all attendance" ON attendance;

DROP POLICY IF EXISTS "Authenticated users can read products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Create simplified, non-recursive policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Simple admin policy using auth.jwt() to avoid recursion
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );

-- Create simplified policies for stores
CREATE POLICY "All authenticated users can read stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage stores"
  ON stores
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );

-- Create simplified policies for attendance
CREATE POLICY "Users can read own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own attendance"
  ON attendance
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all attendance"
  ON attendance
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );

-- Create simplified policies for products
CREATE POLICY "All authenticated users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );

-- Create simplified policies for orders
CREATE POLICY "All authenticated users can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );

-- Create simplified policies for order_items
CREATE POLICY "All authenticated users can read order_items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage order_items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );

-- Create simplified policies for tasks
CREATE POLICY "Users can read assigned tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Users can update assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Admins can manage all tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );

-- Create simplified policies for payroll
CREATE POLICY "Users can read own payroll"
  ON payroll
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all payroll"
  ON payroll
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );

-- Create simplified policies for messages
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update message read status"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Create simplified policies for activity_logs
CREATE POLICY "Users can read own activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata' ->> 'role')::text,
      (auth.jwt() ->> 'app_metadata' ->> 'role')::text,
      'employee'
    ) = 'admin'
  );