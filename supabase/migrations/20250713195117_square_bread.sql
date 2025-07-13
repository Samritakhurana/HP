/*
  # Fix attendance table RLS policies

  1. Security
    - Ensure proper INSERT policy for attendance
    - Add UPDATE policy for check-out functionality
    - Maintain existing read policies
*/

-- Update INSERT policy for attendance
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;
CREATE POLICY "Users can insert own attendance" ON attendance
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update UPDATE policy for attendance
DROP POLICY IF EXISTS "Users can update own attendance" ON attendance;
CREATE POLICY "Users can update own attendance" ON attendance
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());