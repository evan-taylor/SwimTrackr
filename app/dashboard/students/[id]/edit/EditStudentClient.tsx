'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

// Define types
type Student = Database['public']['Tables']['students']['Row'];

type Level = {
  id: string;
  name: string;
  description: string | null;
};

type Facility = {
  id: string;
  name: string;
  address: string | null;
};

// Client component now receives the id directly as a prop
export default function EditStudentClient({ id }: { id: string }) {
  const router = useRouter();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    medical_notes: '',
    current_level_id: '',
    facility_id: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function fetchStudentAndOptions() {
      try {
        setLoading(true);
        
        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        
        // Get user's profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, facility_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        setUserRole(profile.role);
        
        // Check if user has permission to edit this student
        let canAccess = false;
        
        // Get student basic info first to check access
        const { data: studentBasic, error: studentBasicError } = await supabase
          .from('students')
          .select('parent_id, facility_id')
          .eq('id', id)
          .single();
          
        if (studentBasicError) {
          throw studentBasicError;
        }
        
        if (profile.role === 'admin') {
          canAccess = true;
        } else if (profile.role === 'manager') {
          // Managers can edit students in their facility
          canAccess = studentBasic.facility_id === profile.facility_id;
        } else if (profile.role === 'parent' || profile.role === 'facility_parent') {
          // Parents can only edit their own children
          canAccess = studentBasic.parent_id === user.id;
        }
        
        if (!canAccess) {
          setError('You do not have permission to edit this student.');
          setLoading(false);
          return;
        }
        
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('id', id)
          .single();
        
        if (studentError) {
          throw studentError;
        }
        
        setStudent(studentData);
        setFormData({
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          date_of_birth: studentData.date_of_birth,
          gender: studentData.gender || '',
          medical_notes: studentData.medical_notes || '',
          current_level_id: studentData.current_level_id || '',
          facility_id: studentData.facility_id || '',
        });
        
        // Fetch levels
        const { data: levelsData, error: levelsError } = await supabase
          .from('levels')
          .select('*')
          .order('name');
          
        if (levelsError) {
          throw levelsError;
        }
        
        setLevels(levelsData);
        
        // Fetch facilities (only for admin and manager)
        if (profile.role === 'admin') {
          const { data: facilitiesData, error: facilitiesError } = await supabase
            .from('facilities')
            .select('*')
            .order('name');
            
          if (facilitiesError) {
            throw facilitiesError;
          }
          
          setFacilities(facilitiesData);
        } else if (profile.role === 'manager') {
          // For managers, only show their assigned facility
          const { data: facilityData, error: facilityError } = await supabase
            .from('facilities')
            .select('*')
            .eq('id', profile.facility_id)
            .single();
            
          if (facilityError) {
            throw facilityError;
          }
          
          setFacilities([facilityData]);
        }
      } catch (error: any) {
        console.error('Error fetching student details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudentAndOptions();
  }, [supabase, id, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Update student in the database
      const { error: updateError } = await supabase
        .from('students')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          medical_notes: formData.medical_notes,
          current_level_id: formData.current_level_id || null,
          facility_id: formData.facility_id || null,
        })
        .eq('id', id);
      
      if (updateError) {
        throw updateError;
      }
      
      setSuccess(true);
      
      // Redirect back to student details after a short delay
      setTimeout(() => {
        router.push(`/dashboard/students/${id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error updating student:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading student details...</p>
        </div>
      </div>
    );
  }
  
  if (error && !student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center py-10 max-w-md mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-100 dark:border-red-900/30">
            <svg className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error</h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/dashboard/students')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Return to Students
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center py-10 max-w-md mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-100 dark:border-yellow-900/30">
            <svg className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">Student Not Found</h3>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">We couldn't find a student with the provided ID.</p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/dashboard/students')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Return to Students
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Student
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update information for {student.first_name} {student.last_name}
          </p>
        </div>
        
        <div>
          <Link
            href={`/dashboard/students/${id}`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 dark:text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400 dark:text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-600 dark:text-green-400">Student information updated successfully. Redirecting...</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* First Name */}
          <div className="sm:col-span-3">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name*
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="first_name"
                id="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
              />
            </div>
          </div>
          
          {/* Last Name */}
          <div className="sm:col-span-3">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name*
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="last_name"
                id="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
              />
            </div>
          </div>
          
          {/* Date of Birth */}
          <div className="sm:col-span-3">
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Birth*
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="date_of_birth"
                id="date_of_birth"
                required
                value={formData.date_of_birth}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
              />
            </div>
          </div>
          
          {/* Gender */}
          <div className="sm:col-span-3">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Gender
            </label>
            <div className="mt-1">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </div>
          
          {/* Level */}
          <div className="sm:col-span-3">
            <label htmlFor="current_level_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Swimming Level
            </label>
            <div className="mt-1">
              <select
                id="current_level_id"
                name="current_level_id"
                value={formData.current_level_id}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Facility - only for admin and manager */}
          {(userRole === 'admin' || userRole === 'manager') && (
            <div className="sm:col-span-3">
              <label htmlFor="facility_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Facility
              </label>
              <div className="mt-1">
                <select
                  id="facility_id"
                  name="facility_id"
                  value={formData.facility_id}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
                  disabled={userRole === 'manager'} // Managers can't change facility
                >
                  <option value="">Select Facility</option>
                  {facilities.map(facility => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {/* Medical Notes */}
          <div className="sm:col-span-6">
            <label htmlFor="medical_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Medical Notes
            </label>
            <div className="mt-1">
              <textarea
                id="medical_notes"
                name="medical_notes"
                rows={3}
                value={formData.medical_notes}
                onChange={handleChange}
                placeholder="Any medical conditions, allergies, or special needs we should be aware of"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <Link
              href={`/dashboard/students/${id}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 mr-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || success}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium transition-colors
                ${submitting || success ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 