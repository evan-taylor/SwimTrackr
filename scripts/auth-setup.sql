-- 1. Configure auth providers
-- Turn on Google OAuth and Email magic links
UPDATE auth.providers
SET enabled = TRUE
WHERE provider_id IN ('google', 'email');

-- 2. Disable password-based auth (optional)
UPDATE auth.providers
SET enabled = FALSE
WHERE provider_id = 'email_password';

-- 3. Configure email templates for magic links
UPDATE auth.templates
SET template = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SwimTrackr Magic Link</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="{{ .SiteURL }}/SwimTrackr-Logo.png" alt="SwimTrackr Logo" style="max-width: 200px; height: auto;">
    </div>
    <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px; text-align: center;">Sign in to SwimTrackr</h1>
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
      Click the button below to sign in to your SwimTrackr account. This link will expire in 24 hours.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=email" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Sign In</a>
    </div>
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
      Or use this 6-digit code to sign in: <strong style="color: #2563eb; font-size: 18px; letter-spacing: 2px;">{{ .Token }}</strong>
    </p>
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
      If you did not request this sign-in link, you can safely ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    <p style="font-size: 12px; color: #6b7280; text-align: center;">
      &copy; SwimTrackr. All rights reserved.
    </p>
  </div>
</body>
</html>'
WHERE type = 'action_link';

-- 4. Set validation options for magic links
UPDATE auth.flow
SET redirect_url = '{{ .SiteURL }}/auth/callback?next=/dashboard'
WHERE flow_type = 'magiclink';

-- 5. Set email rate limits
UPDATE auth.config
SET rate_limit_email_sent = 5, -- Max 5 emails per hour
    mailer_autoconfirm = TRUE, -- Auto-confirm email addresses
    sms_autoconfirm = TRUE;    -- Auto-confirm phone numbers 