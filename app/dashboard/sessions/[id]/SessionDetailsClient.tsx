'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

type SessionWithDetails = Database['public']['Tables']['sessions']['Row'] & {
  facility: { name: string } | null;
  instructor: { id: string; full_name: string; email: string } | null;
  students: Array<{
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    level: number;
    current_level_id: string | null;
  }>;
};

type StudentProgressEntry = {
  id: string;
  task_id: string;
  task_name: string;
  task_description: string | null;
  status: string;
  notes: string | null;
  evaluated_at: string | null;
};

export default function SessionDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [studentProgress, setStudentProgress] = useState<Record<string, StudentProgressEntry[]>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'students' | 'progress'>('details');
  const [tasks, setTasks] = useState<any[]>([]);
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function fetchSessionDetails() {
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
        
        // Fetch session with joined data
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select(`
            *,
            facility:facilities(*),
            instructor:profiles(id, full_name, email),
            students:session_students(
              student:students(
                id, 
                first_name, 
                last_name, 
                date_of_birth, 
                level,
                current_level_id
              )
            )
          `)
          .eq('id', id)
          .single();
          
        if (sessionError) {
          throw sessionError;
        }
        
        // Transform the nested students data
        const transformedSession = {
          ...sessionData,
          students: sessionData.students.map((s: any) => s.student)
        };
        
        setSession(transformedSession as unknown as SessionWithDetails);
        
        // If we have students, fetch tasks for their level to prepare for progress tracking
        if (transformedSession.students.length > 0 && transformedSession.students[0].current_level_id) {
          const levelId = transformedSession.students[0].current_level_id;
          
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('level_id', levelId)
            .order('order_index');
            
          if (tasksError) {
            console.error('Error fetching tasks:', tasksError);
          } else {
            setTasks(tasksData || []);
            
            // For each student, fetch their progress on these tasks
            for (const student of transformedSession.students) {
              const { data: progressData, error: progressError } = await supabase
                .from('student_progress')
                .select(`
                  id,
                  task_id,
                  status,
                  notes,
                  evaluated_at,
                  task:tasks(name, description)
                `)
                .eq('student_id', student.id)
                .in('task_id', tasksData.map((t: any) => t.id));
                
              if (progressError) {
                console.error(`Error fetching progress for student ${student.id}:`, progressError);
              } else {
                // Transform the data to make it easier to work with
                const progressEntries = (progressData || []).map((entry: any) => ({
                  id: entry.id,
                  task_id: entry.task_id,
                  task_name: entry.task.name,
                  task_description: entry.task.description,
                  status: entry.status,
                  notes: entry.notes,
                  evaluated_at: entry.evaluated_at
                }));
                
                setStudentProgress(prev => ({
                  ...prev,
                  [student.id]: progressEntries
                }));
              }
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching session details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSessionDetails();
  }, [supabase, router, id]);
  
  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return 'Not scheduled';
    try {
      return format(parseISO(dateTimeStr), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateTimeStr;
    }
  };
  
  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in-progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
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
  
  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? 'Loading Session...' : session ? session.name : 'Session Not Found'}
          </h1>
          {session && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {session.facility?.name || 'No Facility'} • 
              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(session.status)}`}>
                {session.status || 'Draft'}
              </span>
            </p>
          )}
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Link
            href="/dashboard/sessions"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back to Sessions
          </Link>
          
          {session && (userRole === 'admin' || userRole === 'manager') && (
            <Link
              href={`/dashboard/sessions/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Session
            </Link>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading session details...</p>
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
      ) : !session ? (
        <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Session not found. It may have been deleted or you don't have permission to view it.</p>
          <p className="mt-2">
            <Link href="/dashboard/sessions" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Return to sessions list
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* Tabs navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Session Details
              </button>
              
              <button
                onClick={() => setActiveTab('students')}
                className={`${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Students ({session.students.length})
              </button>
              
              {(userRole === 'admin' || userRole === 'manager' || userRole === 'instructor') && (
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`${
                    activeTab === 'progress'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Progress Tracking
                </button>
              )}
            </nav>
          </div>
          
          {/* Details tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Facility</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{session.facility?.name || 'Unassigned'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor</h3>
                  {session.instructor ? (
                    <div className="mt-1">
                      <p className="text-sm text-gray-900 dark:text-white">{session.instructor.full_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{session.instructor.email}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">Unassigned</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{session.level || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Schedule</h3>
                  <div className="mt-1">
                    {session.start_time ? (
                      <>
                        <p className="text-sm text-gray-900 dark:text-white">Start: {formatDateTime(session.start_time)}</p>
                        {session.end_time && (
                          <p className="text-sm text-gray-900 dark:text-white">End: {formatDateTime(session.end_time)}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">Not scheduled</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Capacity</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {session.students.length} / {session.max_students} students
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Visibility</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {session.is_public ? 'Public' : 'Private'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Students tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enrolled Students</h3>
                
                {(userRole === 'admin' || userRole === 'manager') && (
                  <Link
                    href={`/dashboard/sessions/${id}/enroll`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Students
                  </Link>
                )}
              </div>
              
              {session.students.length === 0 ? (
                <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No students enrolled in this session yet.</p>
                  {(userRole === 'admin' || userRole === 'manager') && (
                    <p className="mt-2">
                      <Link
                        href={`/dashboard/sessions/${id}/enroll`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Enroll students now
                      </Link>
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {session.students.map((student) => (
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Level {student.level}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/dashboard/students/${student.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                            >
                              View
                            </Link>
                            {(userRole === 'admin' || userRole === 'manager') && (
                              <button
                                onClick={() => {
                                  // Handle unenroll functionality (to be implemented)
                                  alert('Unenroll functionality will be implemented here');
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Unenroll
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Progress tracking tab */}
          {activeTab === 'progress' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Student Progress Tracking</h3>
              </div>
              
              {session.students.length === 0 ? (
                <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No students enrolled in this session for progress tracking.</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No tasks defined for this level. Progress tracking is not available.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Track student progress across skills and tasks for this level. Detailed progress tracking functionality will be implemented in a future update.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {session.students.map((student) => (
                      <div key={student.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {student.first_name} {student.last_name}
                        </h4>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Age: {calculateAge(student.date_of_birth)} • Level {student.level}
                        </div>
                        
                        <Link
                          href={`/dashboard/students/${student.id}/progress`}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View detailed progress
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 