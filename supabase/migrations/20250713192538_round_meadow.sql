/*
  # Add INSERT policy for tasks table

  1. Security
    - Add policy for authenticated users to insert tasks
    - Users can only create tasks where they are the assigner (assigned_by = auth.uid())
    - This ensures users can only assign tasks on behalf of themselves
*/

-- Add INSERT policy for tasks table
CREATE POLICY "Users can insert tasks they assign"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (assigned_by = auth.uid());