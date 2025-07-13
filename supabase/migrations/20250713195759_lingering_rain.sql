/*
  # Enforce Single Admin User Constraint

  1. Database Changes
    - Add constraint to ensure only one admin exists
    - Create trigger to prevent multiple admins
    - Add function to validate admin count

  2. Security
    - Prevent creation of multiple admin users
    - Maintain data integrity for role hierarchy
*/

-- Function to check admin count
CREATE OR REPLACE FUNCTION check_single_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to insert/update to admin role
  IF NEW.role = 'admin' THEN
    -- Check if there's already an admin (excluding current user for updates)
    IF EXISTS (
      SELECT 1 FROM users 
      WHERE role = 'admin' 
      AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) THEN
      RAISE EXCEPTION 'Only one admin user is allowed in the system';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single admin
DROP TRIGGER IF EXISTS enforce_single_admin_trigger ON users;
CREATE TRIGGER enforce_single_admin_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_single_admin();

-- Ensure we have exactly one admin (keep the first one, convert others to employee)
WITH first_admin AS (
  SELECT id FROM users 
  WHERE role = 'admin' 
  ORDER BY created_at ASC 
  LIMIT 1
)
UPDATE users 
SET role = 'employee' 
WHERE role = 'admin' 
AND id NOT IN (SELECT id FROM first_admin);

-- If no admin exists, we'll need to manually promote one
-- This is a safety check - in practice, there should always be at least one admin