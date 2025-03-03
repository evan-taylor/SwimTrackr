import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Redirect to login if not authenticated
    redirect('/auth/login');
  }
  
  // Fetch user profile to get role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (error || !profile) {
    // If profile not found, redirect to create profile
    redirect('/profile/create');
  }
  
  // Temporary dashboard until role-specific pages are created
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome to SwimTrackr</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Your Profile</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600">Email: {profile.email}</p>
            <p className="text-gray-600">Role: {profile.role}</p>
            {profile.full_name && (
              <p className="text-gray-600">Name: {profile.full_name}</p>
            )}
            {profile.facility_id && (
              <p className="text-gray-600">Facility ID: {profile.facility_id}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/dashboard/settings"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-medium text-blue-900">Profile Settings</h3>
              <p className="text-blue-700 text-sm">Update your personal information</p>
            </a>
            
            {profile.role === 'admin' && (
              <div className="block p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-900">Admin Dashboard</h3>
                <p className="text-purple-700 text-sm">Coming soon</p>
              </div>
            )}
            
            {(profile.role === 'admin' || profile.role === 'manager') && (
              <div className="block p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900">Facility Management</h3>
                <p className="text-green-700 text-sm">Coming soon</p>
              </div>
            )}
            
            {(profile.role === 'instructor') && (
              <div className="block p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-900">My Sessions</h3>
                <p className="text-yellow-700 text-sm">Coming soon</p>
              </div>
            )}
            
            {(profile.role === 'parent' || profile.role === 'facility_parent') && (
              <div className="block p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-medium text-indigo-900">Children Progress</h3>
                <p className="text-indigo-700 text-sm">Coming soon</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Note: Role-specific dashboards are currently under development. You'll be notified when they're ready.</p>
        </div>
      </div>
    </div>
  );
} 