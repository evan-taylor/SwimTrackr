'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

// Define types
type Student = Database['public']['Tables']['students']['Row'] & {
  parent: { full_name: string | null; email: string } | null;
  facility: { name: string } | null;
  level_name: string | null;
  enrollment_count: number;
};

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    level: '',
    searchTerm: '',
  });
  const [facilityId, setFacilityId] = useState<string | null>(null);
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function fetchStudents() {
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
          .select('role, facility_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        setUserRole(profile.role);
        setFacilityId(profile.facility_id);
        
        // Build the query depending on the user's role
        let query = supabase
          .from('students')
          .select(`
            *,
            parent:profiles(full_name, email),
            facility:facilities(name),
            level_info:levels!inner(name),
            enrollment_count:session_students(count)
          `);
        
        // Apply role-based filters
        if (profile.role !== 'admin') {
          // Managers, instructors see students in their facility
          if (profile.role === 'manager' || profile.role === 'instructor') {
            query = query.eq('facility_id', profile.facility_id);
          } 
          // Parents see only their children
          else if (profile.role === 'parent' || profile.role === 'facility_parent') {
            query = query.eq('parent_id', user.id);
          }
        }
        
        // Apply UI filters
        if (filters.level) {
          query = query.eq('current_level_id', filters.level);
        }
        
        // Search filter - only apply if there's a search term
        if (filters.searchTerm) {
          query = query.or(`first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%`);
        }
        
        // Execute the query
        const { data, error: studentsError } = await query;
        
        if (studentsError) {
          throw studentsError;
        }
        
        // Transform the data for easier display
        const transformedData = data.map(student => ({
          ...student,
          level_name: student.level_info?.name || null,
          enrollment_count: student.enrollment_count?.[0]?.count || 0
        }));
        
        setStudents(transformedData as Student[]);
      } catch (error: any) {
        console.error('Error fetching students:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudents();
  }, [supabase, router, filters]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  function calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  const handleAddStudent = () => {
    if (userRole === 'parent' || userRole === 'facility_parent') {
      router.push('/dashboard/students/new');
    } else {
      // For admins, managers, instructors - they need to know which parent to assign the student to
      router.push('/dashboard/students/new-with-parent');
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students Management</h1>
        
        {(userRole === 'admin' || userRole === 'manager' || userRole === 'parent' || userRole === 'facility_parent') && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Add New Student
            </button>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
          <input
            type="text"
            id="searchTerm"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
            placeholder="Search by name..."
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          />
        </div>
        
        <div className="w-full md:w-auto">
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
          <select
            id="level"
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Levels</option>
            {/* Ideally this would be populated from the database */}
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      
      {/* Students table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading students...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500 dark:text-red-400">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Try again
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No students found with the current filters.</p>
            {(userRole === 'admin' || userRole === 'manager' || userRole === 'parent' || userRole === 'facility_parent') && (
              <p className="mt-2">
                <button
                  onClick={handleAddStudent}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Add your first student
                </button>
              </p>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Level
                </th>
                {(userRole === 'admin' || userRole === 'manager' || userRole === 'instructor') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Parent
                  </th>
                )}
                {(userRole === 'admin') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Facility
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sessions
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.first_name} {student.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {calculateAge(student.date_of_birth)} years
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {format(parseISO(student.date_of_birth), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.level_name || `Level ${student.level}`}
                    </div>
                  </td>
                  {(userRole === 'admin' || userRole === 'manager' || userRole === 'instructor') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {student.parent?.full_name || 'No parent'}
                      </div>
                      {student.parent?.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{student.parent.email}</div>
                      )}
                    </td>
                  )}
                  {(userRole === 'admin') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.facility?.name || 'Unassigned'}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.enrollment_count || 0} session{student.enrollment_count !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      View
                    </Link>
                    {(userRole === 'admin' || userRole === 'manager' || (userRole?.includes('parent') && student.parent_id === facilityId)) && (
                      <Link
                        href={`/dashboard/students/${student.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 