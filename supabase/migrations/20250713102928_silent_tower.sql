/*
  # Create activity_logs table

  1. New Tables
    - `activity_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `action` (text)
      - `details` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `activity_logs` table
    - Add policies for users to read their own activity
    - Add policies for admins to read all activity
*/

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own activity logs
CREATE POLICY "Users can read own activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- All authenticated users can insert activity logs
CREATE POLICY "Users can insert activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can read all activity logs
CREATE POLICY "Admins can read all activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );