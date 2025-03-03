import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/lib/database.types';
import LogoutButton from '../components/logout-button';
import UserRoleBadge from '../components/user-role-badge';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUser();
  
  // If not logged in, redirect to login
  if (!userData) {
    redirect('/auth/login');
  }
  
  const { profile } = userData;
  const userRole = profile?.role as UserRole;
  
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                <span className="inline-block">Swim</span>
                <span className="inline-block text-blue-800">Trackr</span>
              </Link>
            </div>
            
            <div className="mt-6 px-4">
              <div className="mb-2">
                <div className="text-sm font-medium text-gray-500">Logged in as</div>
                <div className="text-sm font-medium text-gray-900">{profile?.full_name || profile?.email}</div>
                <div className="mt-1">
                  <UserRoleBadge role={userRole} />
                </div>
              </div>
            </div>
            
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              {/* Common navigation for all users */}
              <Link
                href="/dashboard"
                className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                Dashboard
              </Link>
              
              {/* Admin-specific navigation */}
              {userRole === 'admin' && (
                <>
                  <Link
                    href="/admin/facilities"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    Facilities
                  </Link>
                  <Link
                    href="/admin/users"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/program-packages"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    Program Packages
                  </Link>
                </>
              )}
              
              {/* Manager-specific navigation */}
              {(userRole === 'admin' || userRole === 'manager') && (
                <>
                  <Link
                    href="/manager/sessions"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    Sessions
                  </Link>
                  <Link
                    href="/manager/instructors"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    Instructors
                  </Link>
                  <Link
                    href="/manager/students"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    Students
                  </Link>
                </>
              )}
              
              {/* Instructor-specific navigation */}
              {(userRole === 'admin' || userRole === 'manager' || userRole === 'instructor') && (
                <>
                  <Link
                    href="/instructor/my-sessions"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    My Sessions
                  </Link>
                  <Link
                    href="/instructor/progress-tracking"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    Progress Tracking
                  </Link>
                </>
              )}
              
              {/* Parent-specific navigation */}
              {(userRole === 'parent' || userRole === 'facility_parent') && (
                <>
                  <Link
                    href="/parent/children"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    My Children
                  </Link>
                  <Link
                    href="/parent/progress"
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    Progress Reports
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <Link
                  href="/dashboard/settings"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Settings
                </Link>
              </div>
              <div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            <span className="inline-block">Swim</span>
            <span className="inline-block text-blue-800">Trackr</span>
          </Link>
          
          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 