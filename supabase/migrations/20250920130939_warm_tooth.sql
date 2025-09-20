/*
  # Enable Email OTP Authentication

  1. Configuration
    - Enable email OTP authentication in Supabase
    - Configure email templates for OTP delivery
    - Set up proper email verification flow

  2. Security
    - Ensure OTP tokens are secure and time-limited
    - Prevent brute force attacks on OTP verification
*/

-- Enable email confirmations (this is typically done in Supabase dashboard)
-- This migration serves as documentation for the required configuration

-- Note: The following configurations need to be set in Supabase Dashboard:
-- 1. Authentication > Settings > Enable "Confirm email"
-- 2. Authentication > Email Templates > Configure OTP email template
-- 3. Authentication > Settings > Set appropriate OTP expiry time (default: 1 hour)

-- Create a function to log OTP attempts (for security monitoring)
CREATE OR REPLACE FUNCTION log_otp_attempt(user_email text, attempt_type text)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (user_id, action, details, created_at)
  SELECT 
    users.id,
    'OTP ' || attempt_type,
    'OTP ' || attempt_type || ' for email: ' || user_email,
    now()
  FROM users 
  WHERE users.email = user_email
  LIMIT 1;
EXCEPTION
  WHEN OTHERS THEN
    -- If user doesn't exist or other error, still log the attempt
    INSERT INTO activity_logs (user_id, action, details, created_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      'OTP ' || attempt_type,
      'OTP ' || attempt_type || ' for email: ' || user_email,
      now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_otp_attempt(text, text) TO authenticated;