'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

// Form component with Google and magic link login
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Create Supabase client
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMagicLinkSent(true);
    } catch (err) {
      console.error('Magic link error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      // After successful verification, redirect to the dashboard
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const toggleOtpMode = () => {
    setShowOtpInput(!showOtpInput);
    setError(null);
  };

  return (
    <div className="max-w-sm">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image 
          src="/SwimTrackr-Logo.png" 
          alt="SwimTrackr Logo" 
          width={150} 
          height={40}
        />
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 mb-6" role="alert">
          {error}
        </div>
      )}
      
      {magicLinkSent && !showOtpInput && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 mb-6" role="alert">
          <p className="mb-2">Check your email for a magic link! We've sent a login link to {email}.</p>
          <p className="text-sm">
            <button
              type="button"
              onClick={toggleOtpMode}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Use verification code instead
            </button>
          </p>
        </div>
      )}

      {!magicLinkSent && !showOtpInput ? (
        <>
          {/* Google sign in button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full justify-center items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
          >
            <Image 
              src="/google-icon.svg" 
              alt="Google" 
              width={18} 
              height={18} 
            />
            Sign in with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-blue-50 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Magic Link form */}
          <form onSubmit={handleMagicLinkLogin}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        </>
      ) : showOtpInput ? (
        /* OTP verification form */
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Enter Verification Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code that was sent to your email along with the magic link.
            </p>
            
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
              placeholder="6-digit code"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Sign In with Code'}
          </button>
          
          <button
            type="button"
            onClick={toggleOtpMode}
            className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-500"
          >
            Back to magic link
          </button>
        </form>
      ) : (
        /* After magic link sent - waiting state */
        <div className="text-center py-4">
          <button
            type="button"
            onClick={() => {
              setMagicLinkSent(false);
              setEmail('');
            }}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Use a different email
          </button>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          New to SwimTrackr?{' '}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
} 