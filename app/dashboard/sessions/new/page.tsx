'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';

type LevelOption = {
  id: string;
  name: string;
  program_package_id: string | null;
};

type InstructorOption = {
  id: string;
  full_name: string | null;
  email: string;
};

export default function NewSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [facility, setFacility] = useState<{ id: string; name: string } | null>(null);
  
  const [sessionData, setSessionData] = useState({
    name: '',
    instructor_id: '',
    level: '',
    max_students: 8,
    start_time: '',
    end_time: '',
    status: 'scheduled',
    is_public: true,
  });

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Get user's profile to determine role and facility
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // Fetch facility info if the user is associated with one
        if (profile.facility_id) {
          const { data: facilityData, error: facilityError } = await supabase
            .from('facilities')
            .select('id, name')
            .eq('id', profile.facility_id)
            .single();

          if (facilityError) {
            throw facilityError;
          }

          setFacility(facilityData);

          // Fetch instructors associated with this facility
          const { data: instructorsData, error: instructorsError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('facility_id', profile.facility_id)
            .in('role', ['instructor']);

          if (instructorsError) {
            throw instructorsError;
          }

          setInstructors(instructorsData || []);

          // Fetch levels from program packages associated with this facility
          const { data: facilityWithPackage, error: packageError } = await supabase
            .from('facilities')
            .select('program_package_id')
            .eq('id', profile.facility_id)
            .single();

          if (packageError) {
            throw packageError;
          }

          if (facilityWithPackage.program_package_id) {
            const { data: levelsData, error: levelsError } = await supabase
              .from('levels')
              .select('id, name, program_package_id')
              .eq('program_package_id', facilityWithPackage.program_package_id)
              .order('order_index');

            if (levelsError) {
              throw levelsError;
            }

            setLevels(levelsData || []);
          }
        } else if (profile.role === 'admin') {
          // Admins might see all instructors
          const { data: instructorsData, error: instructorsError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('role', ['instructor']);

          if (instructorsError) {
            throw instructorsError;
          }

          setInstructors(instructorsData || []);

          // For admins, perhaps fetch default levels
          const { data: levelsData, error: levelsError } = await supabase
            .from('levels')
            .select('id, name, program_package_id')
            .eq('is_default', true)
            .order('order_index');

          if (levelsError) {
            throw levelsError;
          }

          setLevels(levelsData || []);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // For number inputs, convert to number
    if (type === 'number') {
      setSessionData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } 
    // For checkboxes, handle as boolean
    else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSessionData(prev => ({ ...prev, [name]: checked }));
    } 
    // For everything else, use the string value
    else {
      setSessionData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get user profile to determine facility
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('facility_id, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Prepare session data
      const newSession = {
        ...sessionData,
        facility_id: facility?.id || profile.facility_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert the new session
      const { data, error: insertError } = await supabase
        .from('sessions')
        .insert([newSession])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      
      // Redirect to the session details page after a short delay
      setTimeout(() => {
        router.push(`/dashboard/sessions/${data.id}`);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating session:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Session</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add a new swimming session to your schedule.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link 
            href="/dashboard/sessions"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back to Sessions
          </Link>
        </div>
      </div>
      
      {loading && !success ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      ) : success ? (
        <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400 dark:text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-300">Session created successfully! Redirecting...</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Name*
              </label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={sessionData.name} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                placeholder="e.g., Tuesday Evening Beginners"
              />
            </div>

            {/* Facility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Facility
              </label>
              <input 
                type="text" 
                value={facility?.name || 'No facility assigned'} 
                disabled 
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 bg-gray-50 dark:bg-gray-700 shadow-sm sm:text-sm cursor-not-allowed" 
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {facility ? 'This session will be associated with your facility.' : 'No facility is associated with your account.'}
              </p>
            </div>

            {/* Instructor */}
            <div>
              <label htmlFor="instructor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Instructor
              </label>
              <select 
                id="instructor_id" 
                name="instructor_id" 
                value={sessionData.instructor_id} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select an instructor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.full_name || instructor.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Level
              </label>
              <select 
                id="level" 
                name="level" 
                value={sessionData.level} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a level</option>
                {levels.map(level => (
                  <option key={level.id} value={level.name}>
                    {level.name}
                  </option>
                ))}
                {levels.length === 0 && (
                  <>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </>
                )}
              </select>
            </div>

            {/* Max Students */}
            <div>
              <label htmlFor="max_students" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Students*
              </label>
              <input 
                type="number" 
                id="max_students" 
                name="max_students" 
                value={sessionData.max_students} 
                onChange={handleChange} 
                required 
                min="1" 
                max="50"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status*
              </label>
              <select 
                id="status" 
                name="status" 
                value={sessionData.status} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Time
              </label>
              <input 
                type="datetime-local" 
                id="start_time" 
                name="start_time" 
                value={sessionData.start_time} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
              />
            </div>

            {/* End Time */}
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Time
              </label>
              <input 
                type="datetime-local" 
                id="end_time" 
                name="end_time" 
                value={sessionData.end_time} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
              />
            </div>

            {/* Public/Private Toggle */}
            <div className="col-span-full">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_public"
                    name="is_public"
                    type="checkbox"
                    checked={sessionData.is_public}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_public" className="font-medium text-gray-700 dark:text-gray-300">
                    Make this session public
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    Public sessions are visible to all users on your facility's schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/sessions"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 