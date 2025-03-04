'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import { format, parseISO, isFuture, startOfToday, endOfDay, addDays } from 'date-fns';
import { 
  IconUserCircle, 
  IconCalendarEvent, 
  IconSwimming, 
  IconBuildingCommunity,
  IconCheckbox,
  IconClock,
  IconArrowRight
} from '@tabler/icons-react';

// Define the types
type UserProfile = Database['public']['Tables']['profiles']['Row'];
type Student = Database['public']['Tables']['students']['Row'] & {
  facility: { name: string } | null;
  level_info: { name: string } | null;
};
type Session = Database['public']['Tables']['sessions']['Row'] & {
  facility: { name: string } | null;
  instructor: { full_name: string | null; email: string } | null;
  students_count: number;
};
type Summary = {
  totalStudents: number;
  totalSessions: number;
  upcomingSessions: number;
  completedTasks: number;
  pendingTasks: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalStudents: 0,
    totalSessions: 0,
    upcomingSessions: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        
        // Get user's profile to determine role and facility
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        setProfile(profileData);
        
        // Build the queries depending on the user's role
        const today = startOfToday();
        const tomorrow = endOfDay(addDays(today, 1));
        
        let studentQuery = supabase
          .from('students')
          .select(`
            *,
            facility:facilities(name),
            level_info:levels(name)
          `);
          
        let sessionQuery = supabase
          .from('sessions')
          .select(`
            *,
            facility:facilities(name),
            instructor:profiles(full_name, email),
            students_count:session_students(count)
          `)
          .order('start_time', { ascending: true })
          .limit(5);
        
        // Apply role-based filters
        if (profileData.role !== 'admin') {
          // Managers, instructors see data in their facility
          if (profileData.role === 'manager' || profileData.role === 'instructor') {
            studentQuery = studentQuery.eq('facility_id', profileData.facility_id);
            sessionQuery = sessionQuery.eq('facility_id', profileData.facility_id);
            
            // Instructors only see their sessions
            if (profileData.role === 'instructor') {
              sessionQuery = sessionQuery.eq('instructor_id', user.id);
            }
          } 
          // Parents see only their children and their sessions
          else if (profileData.role === 'parent' || profileData.role === 'facility_parent') {
            studentQuery = studentQuery.eq('parent_id', user.id);
            
            // For parents, we need to get their children's IDs first
            const { data: childrenData } = await studentQuery;
            
            if (childrenData && childrenData.length > 0) {
              const childrenIds = childrenData.map(child => child.id);
              
              // Then get sessions that have these children enrolled
              sessionQuery = sessionQuery
                .in('id', supabase
                  .from('session_students')
                  .select('session_id')
                  .in('student_id', childrenIds) as unknown as string[]);
            } else {
              // No children, so no sessions
              sessionQuery = sessionQuery.eq('id', 'no-sessions');
            }
          }
        }
        
        // Execute the queries in parallel
        const [studentsResponse, sessionsResponse] = await Promise.all([
          studentQuery,
          sessionQuery
        ]);
        
        if (studentsResponse.error) throw studentsResponse.error;
        if (sessionsResponse.error) throw sessionsResponse.error;
        
        setStudents(studentsResponse.data as Student[]);
        setSessions(sessionsResponse.data.map(session => ({
          ...session,
          students_count: session.students_count?.[0]?.count || 0
        })) as Session[]);
        
        // Calculate summary data
        const upcomingSessions = sessionsResponse.data.filter(
          session => session.start_time && isFuture(parseISO(session.start_time))
        ).length;
        
        // Get task completion stats with simpler queries
        const { count: completedTasks, error: completedError } = await supabase
          .from('student_progress')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');
        
        const { count: inProgressTasks, error: inProgressError } = await supabase
          .from('student_progress')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress');
          
        const { count: notStartedTasks, error: notStartedError } = await supabase
          .from('student_progress')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'not_started');
        
        if (completedError) throw completedError;
        if (inProgressError) throw inProgressError;
        if (notStartedError) throw notStartedError;
        
        setSummary({
          totalStudents: studentsResponse.data.length,
          totalSessions: sessionsResponse.data.length,
          upcomingSessions,
          completedTasks: completedTasks || 0,
          pendingTasks: (inProgressTasks || 0) + (notStartedTasks || 0)
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [supabase, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Welcome, {profile?.full_name || profile?.email || 'User'}!
      </h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 flex-shrink-0">
            <IconUserCircle className="h-6 w-6 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.totalStudents}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 flex-shrink-0">
            <IconCalendarEvent className="h-6 w-6 text-purple-700 dark:text-purple-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Sessions</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.upcomingSessions}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 flex-shrink-0">
            <IconCheckbox className="h-6 w-6 text-green-700 dark:text-green-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.completedTasks}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 flex-shrink-0">
            <IconClock className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.pendingTasks}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content - 2 columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h2>
            <Link href="/dashboard/sessions" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center">
              View all
              <IconArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {sessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">No upcoming sessions found.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{session.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session.start_time ? format(parseISO(session.start_time), 'MMM d, yyyy • h:mm a') : 'No date set'}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {session.students_count} / {session.max_students} students
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Instructor: </span>
                      <span className="text-gray-700 dark:text-gray-300">{session.instructor?.full_name || session.instructor?.email || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Student List or Tasks Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile?.role === 'parent' || profile?.role === 'facility_parent' ? 'Your Children' : 'Recent Students'}
            </h2>
            <Link href="/dashboard/students" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center">
              View all
              <IconArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {students.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No students found.</p>
                {(profile?.role === 'parent' || profile?.role === 'facility_parent') && (
                  <Link href="/dashboard/students/new" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    Add your first student
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {students.slice(0, 5).map((student) => (
                  <div key={student.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                    <Link href={`/dashboard/students/${student.id}`}>
                      <div className="flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 py-2 rounded-md">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Level: {student.level_info?.name || `Level ${student.level}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            <IconSwimming className="mr-1 h-3 w-3" />
                            Active
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Admin and Manager specific content - Facility Stats */}
      {(profile?.role === 'admin' || profile?.role === 'manager') && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile.role === 'admin' ? 'System Overview' : 'Facility Overview'}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <IconBuildingCommunity className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Facility Utilization</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">78%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average session fill rate</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <IconSwimming className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Skill Progress</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">68%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasks completed this month</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <IconUserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Instructor Activity</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">12.5</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. students per instructor</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructor specific content - Class Schedule */}
      {profile?.role === 'instructor' && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Teaching Schedule</h2>
          </div>
          <div className="p-6">
            {sessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming classes scheduled.</p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 mr-4">
                      {session.start_time && (
                        <>
                          <p className="text-xs text-blue-800 dark:text-blue-300 font-bold text-center">
                            {format(parseISO(session.start_time), 'MMM')}
                          </p>
                          <p className="text-xl text-blue-800 dark:text-blue-300 font-bold text-center">
                            {format(parseISO(session.start_time), 'd')}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{session.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session.start_time ? format(parseISO(session.start_time), 'h:mm a') : 'No time set'} • Level: {session.level || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {session.students_count} students
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="text-center mt-4">
                  <Link href="/dashboard/sessions" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    View full schedule
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 