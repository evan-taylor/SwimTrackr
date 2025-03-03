import { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Login - SwimTrackr',
  description: 'Sign in to your SwimTrackr account',
};

export default function Login() {
  return <LoginForm />;
} 