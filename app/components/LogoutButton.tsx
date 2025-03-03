'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';

interface LogoutButtonProps {
  buttonText?: string;
  className?: string;
}

export default function LogoutButton({
  buttonText = 'Sign Out',
  className = 'text-sm font-medium text-gray-700 hover:text-gray-900',
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {loading ? 'Signing out...' : buttonText}
    </button>
  );
} 