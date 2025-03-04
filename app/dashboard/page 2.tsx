'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { IconUsers, IconCalendar, IconSwimming, IconBuilding, IconChartBar, IconArrowRight } from '@tabler/icons-react';

// Define a type for Supabase count result
type CountResult = { count: number } | null;

type DashboardStats = {
  studentCount: number;
  sessionCount: number;
  facilityCount?: number;
  instructorCount?: number;
  upcomingSessions: any[];
  recentProgress?: any[];
  childrenCount?: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    studentCount: 0,
    sessionCount: 0,
    facilityCount: 0,
    instructorCount: 0,
    upcomingSessions: [],
    recentProgress: [],
    childrenCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function fetchDashboardData() {
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
        
        // Initialize stats object
        const dashboardStats: DashboardStats = {
          studentCount: 0,
          sessionCount: 0,
          upcomingSessions: [],
        };
        
        // Fetch stats based on role
        if (profile.role === 'admin') {
          // Admins see global stats
          
          // Student count
          const { count: studentCount, error: studentCountError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true });
            
          if (studentCountError) throw studentCountError;
          dashboardStats.studentCount = studentCount || 0;
          
          // Session count
          const { count: sessionCount, error: sessionCountError } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true });
            
          if (sessionCountError) throw sessionCountError;
          dashboardStats.sessionCount = sessionCount || 0;
          
          // Facility count
          const { count: facilityCount, error: facilityCountError } = await supabase
            .from('facilities')
            .select('*', { count: 'exact', head: true });
            
          if (facilityCountError) throw facilityCountError;
          dashboardStats.facilityCount = facilityCount || 0;
          
          // Instructor count
          const { count: instructorCount, error: instructorCountError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'instructor');
            
          if (instructorCountError) throw instructorCountError;
          dashboardStats.instructorCount = instructorCount || 0;
          
          // Upcoming sessions
          const { data: upcomingSessions, error: upcomingSessionsError } = await supabase
            .from('sessions')
            .select(`
              id,
              name,
              start_date,
              end_date,
              day_of_week,
              start_time,
              instructor:profiles(full_name),
              facility:facilities(name),
              student_count:session_students(count)
            `)
            .eq('status', 'active')
            .order('start_date', { ascending: true })
            .limit(5);
            
          if (upcomingSessionsError) throw upcomingSessionsError;
          dashboardStats.upcomingSessions = upcomingSessions || [];
          
          // Recent progress entries
          const { data: recentProgress, error: recentProgressError } = await supabase
            .from('progress')
            .select(`
              id,
              date,
              student:students(first_name, last_name),
              session:sessions(name),
              skill:skills(name),
              proficiency
            `)
            .order('date', { ascending: false })
            .limit(5);
            
          if (recentProgressError) throw recentProgressError;
          dashboardStats.recentProgress = recentProgress || [];
        }
        else if (profile.role === 'manager') {
          // Managers see stats for their facility
          
          // Student count in facility
          const { count: studentCount, error: studentCountError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('facility_id', profile.facility_id);
            
          if (studentCountError) throw studentCountError;
          dashboardStats.studentCount = studentCount || 0;
          
          // Session count in facility
          const { count: sessionCount, error: sessionCountError } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('facility_id', profile.facility_id);
            
          if (sessionCountError) throw sessionCountError;
          dashboardStats.sessionCount = sessionCount || 0;
          
          // Instructor count in facility
          const { count: instructorCount, error: instructorCountError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'instructor')
            .eq('facility_id', profile.facility_id);
            
          if (instructorCountError) throw instructorCountError;
          dashboardStats.instructorCount = instructorCount || 0;
          
          // Upcoming sessions at facility
          const { data: upcomingSessions, error: upcomingSessionsError } = await supabase
            .from('sessions')
            .select(`
              id,
              name,
              start_date,
              end_date,
              day_of_week,
              start_time,
              instructor:profiles(full_name),
              facility:facilities(name),
              student_count:session_students(count)
            `)
            .eq('facility_id', profile.facility_id)
            .eq('status', 'active')
            .order('start_date', { ascending: true })
            .limit(5);
            
          if (upcomingSessionsError) throw upcomingSessionsError;
          dashboardStats.upcomingSessions = upcomingSessions || [];
          
          // Recent progress entries in facility
          const { data: recentProgress, error: recentProgressError } = await supabase
            .from('progress')
            .select(`
              id,
              date,
              student:students(first_name, last_name),
              session:sessions(name),
              skill:skills(name),
              proficiency
            `)
            .eq('session:sessions.facility_id', profile.facility_id)
            .order('date', { ascending: false })
            .limit(5);
            
          if (recentProgressError) throw recentProgressError;
          dashboardStats.recentProgress = recentProgress || [];
        }
        else if (profile.role === 'instructor') {
          // Instructors see their assigned sessions and students
          
          // Upcoming sessions for this instructor
          const { data: upcomingSessions, error: upcomingSessionsError } = await supabase
            .from('sessions')
            .select(`
              id,
              name,
              start_date,
              end_date,
              day_of_week,
              start_time,
              facility:facilities(name),
              student_count:session_students(count)
            `)
            .eq('instructor_id', user.id)
            .eq('status', 'active')
            .order('start_date', { ascending: true })
            .limit(5);
            
          if (upcomingSessionsError) throw upcomingSessionsError;
          dashboardStats.upcomingSessions = upcomingSessions || [];
          
          // Session count for this instructor
          dashboardStats.sessionCount = upcomingSessions?.length || 0;
          
          // Student count in instructor's sessions
          const sessionIds = upcomingSessions?.map((session: any) => session.id) || [];
          if (sessionIds.length > 0) {
            const { count: studentCount, error: studentCountError } = await supabase
              .from('session_students')
              .select('*', { count: 'exact', head: true })
              .in('session_id', sessionIds);
              
            if (studentCountError) throw studentCountError;
            dashboardStats.studentCount = studentCount || 0;
          }
          
          // Recent progress entries by this instructor
          const { data: recentProgress, error: recentProgressError } = await supabase
            .from('progress')
            .select(`
              id,
              date,
              student:students(first_name, last_name),
              session:sessions(name),
              skill:skills(name),
              proficiency
            `)
            .eq('instructor_id', user.id)
            .order('date', { ascending: false })
            .limit(5);
            
          if (recentProgressError) throw recentProgressError;
          dashboardStats.recentProgress = recentProgress || [];
        }
        else if (profile.role === 'parent' || profile.role === 'facility_parent') {
          // Parents see stats for their children
          
          // Children count
          const { count: childrenCount, error: childrenCountError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', user.id);
            
          if (childrenCountError) throw childrenCountError;
          dashboardStats.childrenCount = childrenCount || 0;
          dashboardStats.studentCount = childrenCount || 0;
          
          // Get all children
          const { data: children, error: childrenError } = await supabase
            .from('students')
            .select('id')
            .eq('parent_id', user.id);
            
          if (childrenError) throw childrenError;
          
          const childrenIds = children?.map((child: { id: string }) => child.id) || [];
          
          if (childrenIds.length > 0) {
            // Session count for children
            const { data: sessionsData, error: sessionsError } = await supabase
              .from('session_students')
              .select(`
                session_id,
                session:sessions(
                  id,
                  name,
                  start_date,
                  end_date,
                  day_of_week,
                  start_time,
                  instructor:profiles(full_name),
                  facility:facilities(name)
                )
              `)
              .in('student_id', childrenIds)
              .eq('session:sessions.status', 'active');
              
            if (sessionsError) throw sessionsError;
            
            // Get unique sessions
            const uniqueSessions: any[] = [];
            const sessionIds = new Set();
            for (const entry of sessionsData || []) {
              if (!sessionIds.has(entry.session_id)) {
                sessionIds.add(entry.session_id);
                uniqueSessions.push(entry.session);
              }
            }
            
            dashboardStats.sessionCount = uniqueSessions.length;
            dashboardStats.upcomingSessions = uniqueSessions.slice(0, 5) || [];
            
            // Recent progress for children
            const { data: recentProgress, error: recentProgressError } = await supabase
              .from('progress')
              .select(`
                id,
                date,
                student:students(first_name, last_name),
                session:sessions(name),
                skill:skills(name),
                proficiency
              `)
              .in('student_id', childrenIds)
              .order('date', { ascending: false })
              .limit(5);
              
            if (recentProgressError) throw recentProgressError;
            dashboardStats.recentProgress = recentProgress || [];
          }
        }
        
        setStats(dashboardStats);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [supabase, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's an overview of your {userRole === 'parent' || userRole === 'facility_parent' ? 'children\'s' : ''} swim school activity.
        </p>
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
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-800/30 p-3 rounded-md">
                <IconUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {userRole?.includes('parent') ? 'Children' : 'Students'}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.studentCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/students" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center">
                {userRole?.includes('parent') ? 'View children' : 'View all students'}
                <IconArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-800/30 p-3 rounded-md">
                <IconCalendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {userRole?.includes('parent') ? 'Enrolled Sessions' : 'Active Sessions'}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.sessionCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/sessions" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 flex items-center">
                View all sessions
                <IconArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
        
        {userRole === 'admin' && (
          <>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-800/30 p-3 rounded-md">
                    <IconBuilding className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Facilities
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.facilityCount}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/facilities" className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center">
                    View all facilities
                    <IconArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-800/30 p-3 rounded-md">
                    <IconSwimming className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Instructors
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.instructorCount}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/instructors" className="font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center">
                    View all instructors
                    <IconArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
        
        {(userRole === 'manager') && stats.instructorCount !== undefined && (
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 dark:bg-orange-800/30 p-3 rounded-md">
                  <IconSwimming className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Instructors
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.instructorCount}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/instructors" className="font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center">
                  View all instructors
                  <IconArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {userRole?.includes('parent') && stats.childrenCount !== undefined && (
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-800/30 p-3 rounded-md">
                  <IconChartBar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Recent Progress
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.recentProgress?.length || 0} entries
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/progress" className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center">
                  View progress details
                  <IconArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Sessions</h2>
            <Link href="/dashboard/sessions" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center">
              View all <IconArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {stats.upcomingSessions.length === 0 ? (
            <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No upcoming sessions</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {userRole?.includes('parent') 
                  ? 'Your children are not enrolled in any upcoming sessions.'
                  : userRole === 'instructor' 
                    ? 'You are not assigned to any upcoming sessions.'
                    : 'There are no upcoming sessions scheduled.'}
              </p>
              {!userRole?.includes('parent') && (
                <div className="mt-6">
                  <Link
                    href="/dashboard/sessions/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create new session
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden bg-white dark:bg-gray-800">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.upcomingSessions.map((session: any) => (
                  <li key={session.id} className="py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Link href={`/dashboard/sessions/${session.id}`} className="block">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-800/30 h-12 w-12 rounded-lg flex items-center justify-center">
                          <IconCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {session.name}
                          </p>
                          <div className="flex flex-wrap text-sm text-gray-500 dark:text-gray-400">
                            <p className="mr-4">
                              {session.day_of_week}s at {session.start_time?.substring(0, 5)}
                            </p>
                            {session.facility && (
                              <p className="mr-4">
                                {session.facility.name}
                              </p>
                            )}
                            {session.instructor && (
                              <p>
                                Instructor: {session.instructor.full_name || 'Unassigned'}
                              </p>
                            )}
                          </div>
                        </div>
                        {session.student_count && session.student_count[0]?.count !== undefined && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300">
                              {session.student_count[0]?.count} {session.student_count[0]?.count === 1 ? 'student' : 'students'}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Recent Progress - For parents, instructors, managers and admins */}
        {stats.recentProgress && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Progress</h2>
              <Link href="/dashboard/progress" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center">
                View all <IconArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {stats.recentProgress.length === 0 ? (
              <div className="text-center py-10 border border-gray-200 dark:border-gray-700 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No progress data yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {userRole?.includes('parent') 
                    ? 'No progress has been recorded for your children yet.'
                    : userRole === 'instructor' 
                      ? 'You haven\'t recorded any progress data yet.'
                      : 'No progress data has been recorded yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden bg-white dark:bg-gray-800">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentProgress.map((entry: any) => (
                    <li key={entry.id} className="py-4">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.student?.first_name} {entry.student?.last_name}
                            </div>
                            <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-0.5 px-2 rounded-full">
                              {entry.session?.name}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="truncate">{entry.skill?.name}</span>
                            <span className="mx-1">•</span>
                            <span>{format(parseISO(entry.date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-4 w-4 ${
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
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 