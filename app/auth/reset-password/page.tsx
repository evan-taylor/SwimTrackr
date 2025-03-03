import { Metadata } from 'next';
import Link from 'next/link';
import ResetPasswordForm from './reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password - SwimTrackr',
  description: 'Reset your SwimTrackr password',
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="text-sm text-gray-500">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>
      
      <ResetPasswordForm />
      
      <div className="text-center text-sm">
        <p>
          Remember your password?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 