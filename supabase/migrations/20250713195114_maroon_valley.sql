/*
  # Fix users table RLS policies

  1. Security
    - Ensure proper INSERT policy for user registration
    - Add UPDATE policy for profile updates
    - Maintain existing read policies
*/

-- Update INSERT policy to be more permissive for user registration
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add UPDATE policy for users to update their own profiles
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add admin policy for managing all users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));