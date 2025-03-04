'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import {
  IconUsers,
  IconSwimming,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconBuildingCommunity,
  IconArrowUpRight,
  IconArrowDownRight,
  IconFilter
} from '@tabler/icons-react';

// Define types
type AnalyticsSummary = {
  totalStudents: number;
  totalSessions: number;
  totalInstructors: number;
  completedTasks: number;
  avgAttendanceRate: number;
  studentGrowthRate: number;
};

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalStudents: 0,
    totalSessions: 0,
    totalInstructors: 0,
    completedTasks: 0,
    avgAttendanceRate: 0,
    studentGrowthRate: 0
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [taskCompletionByLevel, setTaskCompletionByLevel] = useState<{name: string, completed: number, total: number}[]>([]);
  const [sessionsByDay, setSessionsByDay] = useState<{day: string, count: number}[]>([]);
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function fetchAnalyticsData() {
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
        
        // Only admins and managers should access this page
        if (profile.role !== 'admin' && profile.role !== 'manager') {
          router.push('/dashboard');
          return;
        }
        
        // In a real app, we would fetch actual analytics data from the database
        // For this demo, we're creating mock data based on user role
        
        // Simulate data loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data for admin (system-wide) vs manager (facility-specific)
        if (profile.role === 'admin') {
          setSummary({
            totalStudents: 1287,
            totalSessions: 384,
            totalInstructors: 42,
            completedTasks: 8562,
            avgAttendanceRate: 92,
            studentGrowthRate: 8.4
          });
          
          setTaskCompletionByLevel([
            { name: 'Beginner', completed: 1240, total: 1500 },
            { name: 'Intermediate', completed: 980, total: 1200 },
            { name: 'Advanced', completed: 680, total: 800 },
            { name: 'Expert', completed: 320, total: 400 }
          ]);
          
          setSessionsByDay([
            { day: 'Mon', count: 65 },
            { day: 'Tue', count: 58 },
            { day: 'Wed', count: 72 },
            { day: 'Thu', count: 63 },
            { day: 'Fri', count: 54 },
            { day: 'Sat', count: 42 },
            { day: 'Sun', count: 30 }
          ]);
        } else {
          // Manager - facility specific data
          setSummary({
            totalStudents: 246,
            totalSessions: 84,
            totalInstructors: 12,
            completedTasks: 1752,
            avgAttendanceRate: 88,
            studentGrowthRate: 5.2
          });
          
          setTaskCompletionByLevel([
            { name: 'Beginner', completed: 340, total: 400 },
            { name: 'Intermediate', completed: 280, total: 350 },
            { name: 'Advanced', completed: 180, total: 210 },
            { name: 'Expert', completed: 90, total: 120 }
          ]);
          
          setSessionsByDay([
            { day: 'Mon', count: 18 },
            { day: 'Tue', count: 15 },
            { day: 'Wed', count: 22 },
            { day: 'Thu', count: 17 },
            { day: 'Fri', count: 14 },
            { day: 'Sat', count: 13 },
            { day: 'Sun', count: 8 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalyticsData();
  }, [supabase, router, timeRange]);
  
  const renderTaskCompletionChart = () => {
    return (
      <div className="mt-4">
        {taskCompletionByLevel.map((level) => (
          <div key={level.name} className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{level.name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {level.completed} / {level.total} ({Math.round((level.completed / level.total) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(level.completed / level.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderSessionsByDayChart = () => {
    const maxCount = Math.max(...sessionsByDay.map(day => day.count));
    
    return (
      <div className="mt-4 flex items-end h-48 gap-2">
        {sessionsByDay.map((day) => (
          <div key={day.day} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-blue-500 dark:bg-blue-600 rounded-t"
              style={{ height: `${(day.count / maxCount) * 100}%` }}
            ></div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
              {day.day}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {day.count}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {userRole === 'admin' ? 'System Analytics' : 'Facility Analytics'}
        </h1>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Time Range:</span>
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-1 pl-3 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
              <IconFilter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{summary.totalStudents}</p>
            </div>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
              <IconUsers className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className={`flex items-center ${summary.studentGrowthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {summary.studentGrowthRate >= 0 ? (
                <IconArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <IconArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(summary.studentGrowthRate)}%</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs previous {timeRange}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{summary.totalSessions}</p>
            </div>
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
              <IconCalendarEvent className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <IconArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">12.5%</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs previous {timeRange}</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{summary.avgAttendanceRate}%</p>
            </div>
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
              <IconCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <IconArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">2.8%</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs previous {timeRange}</span>
          </div>
        </div>
      </div>
      
      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Completion by Level</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Progress tracking across different swim levels
            </p>
          </div>
          <div className="p-6">
            {renderTaskCompletionChart()}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Total Completed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {summary.completedTasks}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Completion Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {Math.round(taskCompletionByLevel.reduce((acc, level) => acc + level.completed, 0) / 
                    taskCompletionByLevel.reduce((acc, level) => acc + level.total, 0) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sessions by Day of Week</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Distribution of sessions throughout the week
            </p>
          </div>
          <div className="p-6">
            {renderSessionsByDayChart()}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Busiest Day</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {sessionsByDay.reduce((prev, current) => (prev.count > current.count) ? prev : current).day}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Avg. Sessions/Day</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {Math.round(sessionsByDay.reduce((acc, day) => acc + day.count, 0) / sessionsByDay.length)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Staff and Facility Performance */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {userRole === 'admin' ? 'Facility Performance' : 'Staff Performance'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {userRole === 'admin' 
              ? 'Comparative performance metrics across all facilities' 
              : 'Instructor effectiveness and student progress metrics'
            }
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <IconBuildingCommunity className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {userRole === 'admin' ? 'Facilities' : 'Instructors'}
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {userRole === 'admin' ? '14' : summary.totalInstructors}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userRole === 'admin' ? 'Active swim schools' : 'Active teaching staff'}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <IconSwimming className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">Student/Instructor</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(summary.totalStudents / summary.totalInstructors)}:1
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average ratio</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <IconClock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">Avg. Session Duration</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">45m</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Minutes per class</p>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Note: Detailed performance metrics and instructor-specific analytics would be available in a full implementation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 