/*
  # Fix activity_logs table RLS policies

  1. Security
    - Add missing INSERT policy for activity logs
    - Allow users to insert their own activity logs
    - Maintain existing read policies
*/

-- Add INSERT policy for activity logs
CREATE POLICY "Users can insert activity logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());