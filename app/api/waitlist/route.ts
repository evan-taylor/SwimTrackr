import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, name, captchaToken } = await request.json();

    // Validate inputs
    if (!email || !name || !captchaToken) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify captcha
    const captchaVerification = await verifyRecaptcha(captchaToken);
    if (!captchaVerification.success) {
      return NextResponse.json(
        { message: 'Captcha verification failed' },
        { status: 400 }
      );
    }

    // Add to Resend audience
    await addToResendAudience(email, name);

    // Send confirmation email
    await sendConfirmationEmail(email, name);

    return NextResponse.json(
      { message: 'Successfully joined waitlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

async function verifyRecaptcha(token: string) {
  // If no secret key is set, allow in development
  if (!RECAPTCHA_SECRET_KEY && process.env.NODE_ENV === 'development') {
    return { success: true };
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY || '',
      response: token,
    }),
  });

  const data = await response.json();
  return { success: data.success === true };
}

async function addToResendAudience(email: string, name: string) {
  try {
    if (!process.env.RESEND_AUDIENCE_ID) {
      console.warn('No Resend audience ID provided. Skipping audience addition.');
      return;
    }

    // Add user to Resend audience
    await resend.contacts.create({
      email,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' '),
      audienceId: process.env.RESEND_AUDIENCE_ID,
      unsubscribed: false,
    });
  } catch (error) {
    console.error('Error adding to Resend audience:', error);
    // Continue processing even if this fails
  }
}

async function sendConfirmationEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to the SwimTrackr Waitlist',
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to SwimTrackr!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for joining our waitlist. We're excited to have you on board!</p>
          <p>We're working hard to bring you the best swim school management platform. You'll be among the first to know when we launch.</p>
          <p>In the meantime, if you have any questions, feel free to reply to this email.</p>
          <p>Best regards,</p>
          <p>The SwimTrackr Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Continue processing even if this fails
  }
} 