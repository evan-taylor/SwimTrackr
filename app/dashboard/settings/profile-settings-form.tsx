'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Tables } from '@/lib/database.types';

interface ProfileSettingsFormProps {
  profile: Tables<'profiles'> | null;
}

export default function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (!profile?.id) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);

      if (error) {
        setError(error.message);
      } else {
        setMessage('Profile updated successfully');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      
      {message && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700" role="alert">
          {message}
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            disabled
            value={profile?.email || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Your email cannot be changed</p>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <input
            type="text"
            name="role"
            id="role"
            disabled
            value={profile?.role || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Role changes must be made by an administrator</p>
        </div>

        {profile?.facility_id && (
          <div>
            <label htmlFor="facility" className="block text-sm font-medium text-gray-700">
              Facility
            </label>
            <input
              type="text"
              name="facility"
              id="facility"
              disabled
              value={profile?.facility_id || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Facility changes must be made by an administrator</p>
          </div>
        )}
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              setFullName(profile?.full_name || '');
              setError(null);
              setMessage(null);
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading || fullName === profile?.full_name}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
} 