/*
  # Fix messages table RLS policies

  1. Security
    - Add missing INSERT policy for messages
    - Ensure users can send messages to any other user
    - Maintain existing read and update policies
*/

-- Add INSERT policy for messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());