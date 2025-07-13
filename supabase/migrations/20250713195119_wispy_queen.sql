/*
  # Fix stores table RLS policies

  1. Security
    - Add INSERT policy for stores (admin only)
    - Add UPDATE policy for stores (admin only)
    - Maintain existing read policies
*/

-- Add INSERT policy for stores (admin only)
CREATE POLICY "Admins can insert stores" ON stores
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Add UPDATE policy for stores (admin only)
CREATE POLICY "Admins can update stores" ON stores
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Add DELETE policy for stores (admin only)
CREATE POLICY "Admins can delete stores" ON stores
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));