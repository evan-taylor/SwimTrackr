# Setting Up Email Templates in Supabase

This guide explains how to configure the custom HTML email templates for SwimTrackr in your Supabase project.

## Email Template Files

The following email template files are available in the `emails` directory:

1. `magic-link.html` - For email sign-in with magic link
2. `change-email.html` - For email address change confirmation
3. `reset-password.html` - For password reset requests
4. `reauthentication.html` - For identity confirmation when performing sensitive actions

## Setup Steps

1. **Access Supabase Authentication Settings**:
   - Log in to your Supabase dashboard at [app.supabase.com](https://app.supabase.com/)
   - Navigate to your project
   - Go to **Authentication** > **Email Templates**

2. **Configure Each Template**:

   ### Magic Link Template
   - Select the **Confirm signup** template type
   - Paste the contents of `emails/magic-link.html` into the HTML body field
   - Update the subject line to: `Sign in to SwimTrackr`
   - Save changes

   ### Change Email Template
   - Select the **Change Email Address** template type
   - Paste the contents of `emails/change-email.html` into the HTML body field
   - Update the subject line to: `Confirm your new email address`
   - Save changes

   ### Reset Password Template
   - Select the **Reset Password** template type
   - Paste the contents of `emails/reset-password.html` into the HTML body field
   - Update the subject line to: `Reset your SwimTrackr password`
   - Save changes

   ### Reauthentication Template
   - Select the **Confirm Identity (MFA)** template type
   - Paste the contents of `emails/reauthentication.html` into the HTML body field
   - Update the subject line to: `Verify your identity`
   - Save changes

3. **Test Email Templates**:
   - In the Supabase dashboard, go to **Authentication** > **Settings**
   - Scroll to the **Email Testing** section
   - Click **Send Test Email** for each template type to verify appearance

## Template Variables

These templates use the following Supabase variables:

- `{{ .ConfirmationURL }}` - The confirmation/verification link
- `{{ .Token }}` - The verification code for OTP verification
- `{{ .Email }}` - The user's current email address
- `{{ .NewEmail }}` - The new email address (for change email template)

## Customization Tips

- The templates are designed with a consistent blue color scheme matching SwimTrackr's branding
- All templates use responsive design that works well on mobile devices
- You can adjust colors, spacing, and text as needed
- Make sure to keep the Supabase template variables (`{{ .Variable }}`) intact
- The logo uses the path `https://www.swimtrackr.app/SwimTrackr-Logo.png` - ensure this URL is accessible 