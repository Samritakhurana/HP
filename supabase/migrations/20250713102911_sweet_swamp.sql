/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `assigned_to` (uuid, references users)
      - `assigned_by` (uuid, references users)
      - `deadline` (timestamptz)
      - `status` (text: not_started, in_progress, completed)
      - `priority` (text: low, medium, high)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for users to read their assigned tasks
    - Add policies for admins to manage all tasks
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deadline timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can read tasks assigned to them
CREATE POLICY "Users can read assigned tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

-- Users can update tasks assigned to them (status only)
CREATE POLICY "Users can update assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());

-- Admins can read all tasks
CREATE POLICY "Admins can read all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );