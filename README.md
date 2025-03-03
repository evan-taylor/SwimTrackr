# SwimTrackr

SwimTrackr is a comprehensive swim school management system designed to streamline operations for swim schools and help parents track their children's progress.

## Features

### For Swim Schools & Facilities
- Session Management: Create and manage swimming lessons
- Instructor Management: Assign instructors and manage schedules
- Student Management: Track attendance and progress
- Parent Communication: Automated notifications and updates

### For Parents
- Independent Progress Tracking: Monitor swimming skills development
- Skill Benchmarks: Record swimming milestones
- Goal Setting: Set and track swimming goals

## Tech Stack

- **Frontend:** Next.js with TypeScript and Tailwind CSS
- **Backend:** Supabase 
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Setup

Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication Setup

SwimTrackr uses Supabase for authentication with Google OAuth and Magic Links.

### Setting up Google OAuth

1. Create a Google Cloud project at [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Enable the Google+ API
3. Create OAuth credentials (Web application type)
4. Add the following authorized redirect URIs:
   - `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
5. In your Supabase dashboard, go to Authentication > Providers > Google
6. Enable Google auth and enter your client ID and client secret
7. Add the Google credentials to your environment variables:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### Setting up Magic Links

1. In your Supabase dashboard, go to Authentication > Providers > Email
2. Enable "Email Link" (Magic Link) authentication
3. Configure the email templates in Authentication > Email Templates
4. Run the auth-setup SQL script to configure authentication:
   ```bash
   psql -h [YOUR_SUPABASE_HOST] -p 5432 -d postgres -U postgres -f scripts/auth-setup.sql
   ```
   Or execute the SQL commands directly in the Supabase SQL Editor.

### Email Testing

For local development, you can use a service like [Mailtrap](https://mailtrap.io/) to test email delivery.
Configure Supabase to use your SMTP settings in the Authentication > Email Settings section.

## License

[MIT](https://choosealicense.com/licenses/mit/)
