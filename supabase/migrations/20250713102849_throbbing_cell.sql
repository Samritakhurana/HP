/*
  # Create attendance table

  1. New Tables
    - `attendance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `date` (date)
      - `check_in` (timestamptz)
      - `check_out` (timestamptz, optional)
      - `status` (text: present, absent, late)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `attendance` table
    - Add policies for users to manage their own attendance
    - Add policies for admins to view all attendance
*/

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in timestamptz,
  check_out timestamptz,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Users can read their own attendance
CREATE POLICY "Users can read own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own attendance
CREATE POLICY "Users can insert own attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own attendance
CREATE POLICY "Users can update own attendance"
  ON attendance
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all attendance
CREATE POLICY "Admins can read all attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all attendance
CREATE POLICY "Admins can manage all attendance"
  ON attendance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );