'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams?.get('role');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/auth/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="space-y-6 text-center">
      <div className="rounded-full bg-green-100 p-3 mx-auto w-12 h-12 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-green-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">Registration Successful!</h1>
      
      <p className="text-gray-600">
        {role === 'parent'
          ? 'Your parent account has been created. You can now sign in and start tracking your children\'s swimming progress.'
          : 'Your account has been created successfully. You can now sign in to your account.'}
      </p>

      <p className="text-gray-600">
        You will be redirected to the login page in {countdown} seconds, or you can{' '}
        <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
          click here to login now
        </Link>
        .
      </p>

      {role === 'parent' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm text-blue-700">
          <p className="font-medium">Next steps:</p>
          <ol className="list-decimal ml-5 mt-2 text-left">
            <li>Log in to your account</li>
            <li>Add your children's information</li>
            <li>Track their swimming progress</li>
          </ol>
        </div>
      )}
    </div>
  );
} 