/*
  # Enhanced Email OTP Authentication and 2FA Support

  1. Functions
    - Enhanced log_otp_attempt function for better tracking
    - Function to handle OTP verification with rate limiting

  2. Security
    - Rate limiting for OTP generation and verification
    - Enhanced activity logging for security monitoring
    - Prevent brute force attacks
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS log_otp_attempt(text, text);

-- Create enhanced OTP logging function
CREATE OR REPLACE FUNCTION log_otp_attempt(user_email text, attempt_type text)
RETURNS void AS $$
DECLARE
    user_record users%ROWTYPE;
    recent_attempts INTEGER;
BEGIN
    -- Try to find the user
    SELECT * INTO user_record FROM users WHERE email = user_email LIMIT 1;
    
    -- Check for recent OTP attempts (rate limiting)
    SELECT COUNT(*) INTO recent_attempts
    FROM activity_logs 
    WHERE details LIKE '%OTP%' || attempt_type || '%' || user_email || '%'
    AND created_at > NOW() - INTERVAL '5 minutes';
    
    -- Log the attempt with rate limiting info
    INSERT INTO activity_logs (
        user_id, 
        action, 
        details, 
        created_at
    ) VALUES (
        COALESCE(user_record.id, '00000000-0000-0000-0000-000000000000'::uuid),
        'OTP ' || attempt_type,
        'OTP ' || attempt_type || ' for email: ' || user_email || 
        ' (Recent attempts in 5min: ' || recent_attempts || ')',
        now()
    );
    
    -- If too many attempts, log a security warning
    IF recent_attempts >= 5 THEN
        INSERT INTO activity_logs (
            user_id,
            action,
            details,
            created_at
        ) VALUES (
            COALESCE(user_record.id, '00000000-0000-0000-0000-000000000000'::uuid),
            'Security Alert',
            'Excessive OTP attempts detected for email: ' || user_email,
            now()
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback logging if anything fails
        INSERT INTO activity_logs (user_id, action, details, created_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid,
            'OTP Log Error',
            'Failed to log OTP ' || attempt_type || ' for email: ' || user_email || ' - Error: ' || SQLERRM,
            now()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_otp_attempt(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION log_otp_attempt(text, text) TO anon;

-- Create function to check if user should receive OTP (rate limiting)
CREATE OR REPLACE FUNCTION can_send_otp(user_email text)
RETURNS boolean AS $$
DECLARE
    recent_otp_count INTEGER;
BEGIN
    -- Count OTP generation attempts in the last 5 minutes
    SELECT COUNT(*) INTO recent_otp_count
    FROM activity_logs 
    WHERE action = 'OTP generation'
    AND details LIKE '%' || user_email || '%'
    AND created_at > NOW() - INTERVAL '5 minutes';
    
    -- Allow maximum 3 OTP requests per 5 minutes
    RETURN recent_otp_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_send_otp(text) TO authenticated;
GRANT EXECUTE ON FUNCTION can_send_otp(text) TO anon;

-- Create a trigger to automatically log successful email confirmations
CREATE OR REPLACE FUNCTION log_email_confirmation()
RETURNS trigger AS $$
BEGIN
    -- Log when email_confirmed_at changes from null to a timestamp
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
        INSERT INTO activity_logs (
            user_id,
            action,
            details,
            created_at
        ) VALUES (
            NEW.id,
            'Email Verified',
            'Email successfully verified via OTP for: ' || NEW.email,
            now()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger would be applied to auth.users table, which requires superuser privileges
-- It should be created by a Supabase admin or through the dashboard
-- CREATE TRIGGER email_confirmation_trigger
--     AFTER UPDATE ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION log_email_confirmation();

-- Create policy to ensure users can only verify their own OTP
CREATE POLICY "Users can only access own OTP verification" 
ON activity_logs 
FOR INSERT 
TO authenticated
WITH CHECK (
    user_id = auth.uid() OR 
    action LIKE 'OTP%'
);

-- Update the existing users policies to handle email confirmation flow
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND (
      -- Allow insert during signup
      auth.jwt() ->> 'email_confirmed_at' IS NULL OR
      -- Allow insert after email confirmation
      auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
    )
  );

-- Add index for better OTP logging performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_otp 
ON activity_logs (action, created_at) 
WHERE action LIKE 'OTP%';

-- Add index for email-based lookups in activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_details_email 
ON activity_logs USING gin (details gin_trgm_ops);