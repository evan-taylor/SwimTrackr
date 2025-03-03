import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileSettingsForm from './profile-settings-form';

// This page requires dynamic rendering for cookie access
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const userData = await getUser();
  
  if (!userData) {
    redirect('/auth/login');
  }
  
  const { profile } = userData;
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal information and preferences.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <ProfileSettingsForm profile={profile} />
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
          <p className="mb-4 text-sm text-gray-500">
            You can change your password by clicking the button below. A password reset email will be sent to your email address.
          </p>
          <a
            href="/auth/reset-password"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset Password
          </a>
        </div>
      </div>
    </div>
  );
} 