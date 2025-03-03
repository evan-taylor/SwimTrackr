import { Metadata } from 'next';
import RegisterForm from './register-form';

export const metadata: Metadata = {
  title: 'Register - SwimTrackr',
  description: 'Create a new SwimTrackr account',
};

export default function RegisterPage() {
  return <RegisterForm />;
} 