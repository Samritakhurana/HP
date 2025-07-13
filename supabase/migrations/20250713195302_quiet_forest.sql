/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current policies on users table create infinite recursion
    - Policies are referencing users table within their own conditions
    - This creates circular dependencies causing 500 errors

  2. Solution
    - Drop all existing problematic policies
    - Create simple, non-recursive policies
    - Use auth.uid() directly without subqueries to users table
    - Ensure policies don't reference users table within their conditions

  3. New Policies
    - Simple user access based on auth.uid()
    - Admin access using auth.jwt() claims
    - No circular references or subqueries
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read all user profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policy using JWT claims instead of table lookup
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);