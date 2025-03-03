import { Metadata } from 'next';
import LoginForm from './login-form';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Login - SwimTrackr',
  description: 'Sign in to your SwimTrackr account',
};

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
} 