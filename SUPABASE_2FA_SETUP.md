# Supabase Configuration for 2FA Email OTP

## Dashboard Settings Required

To enable the 2FA email OTP functionality, you need to configure the following settings in your Supabase Dashboard:

### 1. Authentication Settings

Navigate to: **Authentication → Settings**

#### Email Configuration:

- ✅ **Enable email confirmations** - Turn this ON
- ✅ **Enable email change confirmations** - Turn this ON
- ✅ **Enable secure email change** - Turn this ON
- **Confirm email change with OTP** - Turn this ON

#### OTP Settings:

- **OTP expiry time**: 1 hour (default) or customize as needed
- **Max OTP verification attempts**: 5 (recommended)

### 2. Email Templates

Navigate to: **Authentication → Email Templates**

#### Magic Link Template:

- **Subject**: `Your HP Management Portal Verification Code`
- **Body**: Use the following template:

```html
<h1>Verify Your Email</h1>
<p>Hello,</p>
<p>
  You're signing in to HP C-Destination Management Portal. To complete your
  login, please use the verification code below:
</p>

<div
  style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;"
>
  <h2 style="color: #0096D6; font-size: 32px; letter-spacing: 8px; margin: 0;">
    {{ .Token }}
  </h2>
</div>

<p>This code will expire in 1 hour for security reasons.</p>
<p>
  If you didn't request this verification, you can safely ignore this email.
</p>

<hr style="margin: 30px 0;" />
<p style="color: #666; font-size: 12px;">
  HP C-Destination Management Portal<br />
  This is an automated message, please do not reply.
</p>
```

#### Confirm Signup Template:

- **Subject**: `Welcome to HP Management Portal - Verify Your Email`
- **Body**: Similar to above but with welcome message

### 3. URL Configuration

Navigate to: **Authentication → URL Configuration**

#### Redirect URLs:

Add these URLs to your allowed redirect URLs:

- `http://localhost:5173/verify-otp` (for development)
- `https://yourdomain.com/verify-otp` (for production)

#### Site URL:

- Development: `http://localhost:5173`
- Production: `https://yourdomain.com`

### 4. Database Functions (Already Migrated)

The following functions have been created via migration:

- ✅ `log_otp_attempt(text, text)` - Logs OTP generation and verification
- ✅ `can_send_otp(text)` - Rate limiting for OTP requests
- ✅ Enhanced security policies for 2FA flow

### 5. Rate Limiting Settings

Navigate to: **Settings → API**

Recommended rate limits:

- **Auth requests**: 60 per minute per IP
- **Database requests**: 200 per minute per user

### 6. SMTP Settings (Optional but Recommended)

Navigate to: **Settings → Auth → SMTP Settings**

For production, configure your own SMTP:

- **SMTP Host**: Your email service provider
- **SMTP Port**: Usually 587 for TLS
- **Username/Password**: Your email credentials
- **From Email**: `noreply@yourdomain.com`

### 7. Environment Variables

Ensure these are set in your environment:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing the Setup

1. **Sign Up Flow**:

   - User creates account → Email sent for verification → User enters OTP → Account activated

2. **Sign In Flow**:

   - User enters credentials → If email not verified → OTP sent → User enters OTP → Login complete

3. **Rate Limiting**:

   - Maximum 3 OTP requests per 5 minutes per email
   - Excessive attempts logged for security monitoring

4. **Security Logs**:
   - Check Activity Log page in your app
   - All OTP attempts are logged with timestamps
   - Failed attempts and rate limit violations are tracked

## Troubleshooting

### Common Issues:

1. **OTP emails not received**:

   - Check spam folder
   - Verify SMTP configuration
   - Ensure email templates are properly configured

2. **"Invalid OTP" errors**:

   - Check OTP expiry time
   - Ensure user is entering the latest code
   - Verify email template contains `{{ .Token }}`

3. **Rate limiting too strict**:

   - Adjust the `can_send_otp` function parameters
   - Modify the 5-minute window or 3-request limit

4. **Redirect issues**:
   - Verify redirect URLs in Supabase dashboard
   - Check that routes are properly configured in App.tsx

## Security Benefits

✅ **Two-Factor Authentication**: Email-based second factor  
✅ **Rate Limiting**: Prevents brute force attacks  
✅ **Activity Logging**: Complete audit trail  
✅ **Session Management**: Proper auth state handling  
✅ **Email Verification**: Ensures valid email addresses  
✅ **User Experience**: Smooth OTP flow with resend capability
