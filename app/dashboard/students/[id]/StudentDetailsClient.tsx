'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';

// Define types
type StudentWithDetails = Database['public']['Tables']['students']['Row'] & {
  gender: string;
  medical_notes: string | null;
  parent: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
  } | null;
  facility: {
    id: string;
    name: string;
  } | null;
  level: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

type SessionDetails = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  instructor: {
    full_name: string | null;
  } | null;
  progress: ProgressEntry[] | null;
};

type ProgressEntry = {
  id: string;
  date: string;
  session_id: string;
  skill_id: string;
  proficiency: number;
  notes: string | null;
  skill: {
    name: string;
    category: string;
  } | null;
};

// Client component receives the id directly as a prop
export default function StudentDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  
  const [student, setStudent] = useState<StudentWithDetails | null>(null);
  const [sessions, setSessions] = useState<SessionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function fetchStudentDetails() {
      try {
        setLoading(true);
        
        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        
        setUserId(user.id);
        
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
        
        // Check if user has access to this student
        let canAccess = false;
        
        if (profile.role === 'admin') {
          canAccess = true;
        } else {
          // Get student basic info first to check access
          const { data: studentBasic, error: studentBasicError } = await supabase
            .from('students')
            .select('parent_id, facility_id')
            .eq('id', id)
            .single();
            
          if (studentBasicError) {
            throw studentBasicError;
          }
          
          if (profile.role === 'manager' || profile.role === 'instructor') {
            // Managers and instructors can access students in their facility
            canAccess = studentBasic.facility_id === profile.facility_id;
          } else if (profile.role === 'parent' || profile.role === 'facility_parent') {
            // Parents can only access their own children
            canAccess = studentBasic.parent_id === user.id;
          }
        }
        
        if (!canAccess) {
          setError('You do not have permission to view this student.');
          setLoading(false);
          return;
        }
        
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select(`
            *,
            parent:profiles(*),
            facility:facilities(*),
            level:levels(*)
          `)
          .eq('id', id)
          .single();
        
        if (studentError) {
          throw studentError;
        }
        
        setStudent(studentData as StudentWithDetails);
        
        // Fetch enrolled sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from('session_students')
          .select(`
            session:sessions(
              id,
              name,
              start_date,
              end_date,
              status,
              day_of_week,
              start_time,
              end_time,
              instructor:profiles(full_name)
            )
          `)
          .eq('student_id', id);
        
        if (sessionError) {
          throw sessionError;
        }
        
        // Transform session data
        const sessions = sessionData.map(item => item.session as any);
        
        // Fetch progress records for each session
        const enhancedSessions = await Promise.all(
          sessions.map(async (session) => {
            const { data: progressData, error: progressError } = await supabase
              .from('progress')
              .select(`
                *,
                skill:skills(name, category)
              `)
              .eq('student_id', id)
              .eq('session_id', session.id);
              
            if (progressError) {
              console.error('Error fetching progress:', progressError);
              return { ...session, progress: [] };
            }
            
            return { ...session, progress: progressData as ProgressEntry[] };
          })
        );
        
        setSessions(enhancedSessions as SessionDetails[]);
      } catch (error: any) {
        console.error('Error fetching student details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudentDetails();
  }, [supabase, id, router]);
  
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
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
  
  if (error) {
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
      {/* Header with student name and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="mr-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-300 text-xl font-bold">
              {student.first_name[0]}{student.last_name[0]}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Age: {calculateAge(student.date_of_birth)} • Level: {student.level?.name || 'Unassigned'}
            </p>
          </div>
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Link
            href="/dashboard/students"
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Back to Students
          </Link>
          
          {(userRole === 'admin' || userRole === 'manager' || (userRole?.includes('parent') && student.parent?.id === userId)) && (
            <Link
              href={`/dashboard/students/${student.id}/edit`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Edit Student
            </Link>
          )}
        </div>
      </div>
      
      {/* Tabs navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`pb-4 px-1 ${
              activeTab === 'info'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleTabChange('info')}
          >
            Personal Info
          </button>
          <button
            className={`pb-4 px-1 ${
              activeTab === 'sessions'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleTabChange('sessions')}
          >
            Sessions ({sessions.length})
          </button>
          <button
            className={`pb-4 px-1 ${
              activeTab === 'progress'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleTabChange('progress')}
          >
            Progress
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="mt-6">
        {/* Personal Info Tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Student Information</h2>
              
              <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                  <dd className="text-sm text-gray-900 dark:text-white col-span-2">{student.first_name} {student.last_name}</dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</dt>
                  <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                    {format(parseISO(student.date_of_birth), 'MMMM d, yyyy')} ({calculateAge(student.date_of_birth)} years old)
                  </dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
                  <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                    {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'}
                  </dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</dt>
                  <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                    {student.level?.name || 'Unassigned'}
                    {student.level?.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{student.level.description}</p>
                    )}
                  </dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Facility</dt>
                  <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                    {student.facility?.name || 'Unassigned'}
                  </dd>
                </div>
                
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Medical Notes</dt>
                  <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                    {student.medical_notes || 'No medical notes provided'}
                  </dd>
                </div>
              </dl>
            </div>
            
            {/* Parent Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Parent/Guardian Information</h2>
              
              {student.parent ? (
                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                    <dd className="text-sm text-gray-900 dark:text-white col-span-2">{student.parent.full_name || 'Not provided'}</dd>
                  </div>
                  
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                      <a href={`mailto:${student.parent.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {student.parent.email}
                      </a>
                    </dd>
                  </div>
                  
                  <div className="py-3 grid grid-cols-3">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                    <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                      {student.parent.phone ? (
                        <a href={`tel:${student.parent.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {student.parent.phone}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No parent information available</p>
              )}
            </div>
          </div>
        )}
        
        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Enrolled Sessions</h2>
              
              {(userRole === 'admin' || userRole === 'manager' || (userRole?.includes('parent') && student.parent?.id === userId)) && (
                <Link
                  href={`/dashboard/students/${student.id}/enroll`}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Enroll in Session
                </Link>
              )}
            </div>
            
            {sessions.length === 0 ? (
              <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Sessions</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This student is not enrolled in any sessions yet.
                </p>
                {(userRole === 'admin' || userRole === 'manager' || (userRole?.includes('parent') && student.parent?.id === userId)) && (
                  <div className="mt-6">
                    <Link
                      href={`/dashboard/students/${student.id}/enroll`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Enroll in a Session
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sessions.map((session) => (
                    <li key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Link href={`/dashboard/sessions/${session.id}`} className="block">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{session.name}</h3>
                            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap text-sm text-gray-500 dark:text-gray-400">
                              <div className="mr-6">
                                <span className="font-medium">Dates:</span> {format(parseISO(session.start_date), 'MMM d, yyyy')} - {format(parseISO(session.end_date), 'MMM d, yyyy')}
                              </div>
                              <div className="mr-6">
                                <span className="font-medium">Day:</span> {session.day_of_week}s
                              </div>
                              <div>
                                <span className="font-medium">Time:</span> {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center text-sm">
                              <span className="font-medium mr-2">Instructor:</span>
                              <span>{session.instructor?.full_name || 'Not assigned'}</span>
                            </div>
                            {session.status !== 'active' && (
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${session.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                    session.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                                >
                                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Progress Tracking</h2>
            
            {sessions.length === 0 ? (
              <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Progress Data</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This student needs to be enrolled in sessions to track progress.
                </p>
                {(userRole === 'admin' || userRole === 'manager' || (userRole?.includes('parent') && student.parent?.id === userId)) && (
                  <div className="mt-6">
                    <Link
                      href={`/dashboard/students/${student.id}/enroll`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Enroll in a Session
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {sessions.some(session => session.progress && session.progress.length > 0) ? (
                  <div className="space-y-8">
                    {sessions.map((session) => {
                      if (!session.progress || session.progress.length === 0) return null;
                      
                      // Group progress entries by skill category
                      const progressByCategory: Record<string, ProgressEntry[]> = {};
                      
                      session.progress.forEach(entry => {
                        const category = entry.skill?.category || 'Uncategorized';
                        if (!progressByCategory[category]) {
                          progressByCategory[category] = [];
                        }
                        progressByCategory[category].push(entry);
                      });
                      
                      return (
                        <div key={session.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{session.name}</h3>
                          
                          {Object.entries(progressByCategory).map(([category, entries]) => (
                            <div key={category} className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{category}</h4>
                              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {entries.map(entry => (
                                    <li key={entry.id} className="px-4 py-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.skill?.name}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Updated on {format(parseISO(entry.date), 'MMM d, yyyy')}
                                          </p>
                                          {entry.notes && (
                                            <p className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">
                                              "{entry.notes}"
                                            </p>
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <svg
                                                key={star}
                                                className={`h-5 w-5 ${
                                                  star <= entry.proficiency
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                                }`}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                            ))}
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                              {entry.proficiency}/5
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Progress Records Yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      The instructor has not recorded any progress for this student yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 