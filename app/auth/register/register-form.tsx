'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/success?role=parent`,
          queryParams: {
            // This indicates it's a sign up
            prompt: 'consent',
            access_type: 'offline'
          }
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    setLoading(true);

    try {
      // Sign up with magic link
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/success?role=parent`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMagicLinkSent(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
      
      {magicLinkSent && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 mb-6" role="alert">
          Check your email for a magic link! We've sent a registration link to {email}.
        </div>
      )}

      {!magicLinkSent ? (
        <>
          {/* Google sign up button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="flex w-full justify-center items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
          >
            <Image 
              src="/google-icon.svg" 
              alt="Google" 
              width={18} 
              height={18} 
            />
            Sign up with Google
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
          <form onSubmit={handleMagicLinkSignUp}>
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                placeholder="John Doe"
              />
            </div>

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
      ) : (
        <button
          type="button"
          onClick={() => {
            setMagicLinkSent(false);
            setEmail('');
            setFullName('');
          }}
          className="w-full py-2.5 px-4 rounded-md border border-blue-600 text-blue-600 font-medium hover:bg-blue-50"
        >
          Back to sign up
        </button>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-6">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
} 