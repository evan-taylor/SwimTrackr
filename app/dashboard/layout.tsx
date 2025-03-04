'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import Image from 'next/image';
import { IconHome, IconUsers, IconCalendar, IconSwimming, IconBuilding, IconChartBar, IconSettings, IconLogout, IconMenu2, IconX, IconUser, IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from '@/app/components/ThemeProvider';

type UserProfile = Database['public']['Tables']['profiles']['Row'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function getUserProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Authentication error:', userError);
          router.push('/auth/login');
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Profile error:', error);
          if (error.code === 'PGRST116') {
            // No profile found, redirect to create profile or handle new user
            console.log('No profile found for user');
          }
          setLoading(false);
          return;
        }
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    
    getUserProfile();
  }, [router, supabase]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: IconHome, roles: ['admin', 'manager', 'instructor', 'parent', 'facility_parent'] },
    { name: 'Students', href: '/dashboard/students', icon: IconUsers, roles: ['admin', 'manager', 'instructor', 'parent', 'facility_parent'] },
    { name: 'Sessions', href: '/dashboard/sessions', icon: IconCalendar, roles: ['admin', 'manager', 'instructor', 'parent', 'facility_parent'] },
    { name: 'Skills & Levels', href: '/dashboard/skills', icon: IconSwimming, roles: ['admin', 'manager', 'instructor'] },
    { name: 'Facilities', href: '/dashboard/facilities', icon: IconBuilding, roles: ['admin', 'manager'] },
    { name: 'Analytics', href: '/dashboard/analytics', icon: IconChartBar, roles: ['admin', 'manager'] },
    { name: 'Settings', href: '/dashboard/settings', icon: IconSettings, roles: ['admin', 'manager', 'instructor', 'parent', 'facility_parent'] },
  ];
  
  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    if (!profile?.role) return false;
    return item.roles.includes(profile.role);
  });
  
  // Close the sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? "block" : "hidden"}`} role="dialog" aria-modal="true">
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        {/* Sidebar */}
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transition ease-in-out duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Close sidebar button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <IconX className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Logo and navigation */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                SwimTrackr
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href || pathname?.startsWith(item.href + '/')
                      ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <item.icon className={`${
                    pathname === item.href || pathname?.startsWith(item.href + '/')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  } mr-4 flex-shrink-0 h-6 w-6`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Profile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-300 text-lg font-bold">
                  {profile?.full_name?.[0] || profile?.email?.[0] || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                  {profile?.role?.replace('_', ' ') || 'Role not set'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                SwimTrackr
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href || pathname?.startsWith(item.href + '/')
                      ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon className={`${
                    pathname === item.href || pathname?.startsWith(item.href + '/')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  } mr-3 flex-shrink-0 h-5 w-5`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          {/* Profile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-300 text-lg font-bold">
                    {profile?.full_name?.[0] || profile?.email?.[0] || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                    {profile?.role?.replace('_', ' ') || 'Role not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:pl-64">
        <div className="max-w-full mx-auto flex flex-col flex-1">
          {/* Top navigation */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  {/* Mobile menu button */}
                  <div className="flex-shrink-0 flex items-center md:hidden">
                    <button
                      type="button"
                      className="p-2 rounded-md text-gray-400 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <span className="sr-only">Open sidebar</span>
                      <IconMenu2 className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Page title */}
                  <div className="flex-1 flex items-center justify-center md:justify-start">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white md:hidden">
                        SwimTrackr
                      </h1>
                    </div>
                  </div>
                </div>
                
                {/* Right side menu */}
                <div className="flex items-center">
                  {/* Theme toggle */}
                  <button
                    type="button"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
                  </button>
                  
                  {/* Profile dropdown */}
                  <div className="ml-4 relative flex-shrink-0">
                    <div>
                      <button
                        type="button"
                        className="bg-white dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        id="user-menu-button"
                        aria-expanded={userMenuOpen}
                        aria-haspopup="true"
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-300 text-sm font-bold">
                          {profile?.full_name?.[0] || profile?.email?.[0] || 'U'}
                        </div>
                      </button>
                    </div>
                    
                    {/* Profile dropdown menu */}
                    {userMenuOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                        tabIndex={-1}
                      >
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                          tabIndex={-1}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <IconUser className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          Your Profile
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                          tabIndex={-1}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <IconSettings className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          Settings
                        </Link>
                        <button
                          type="button"
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                          tabIndex={-1}
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleSignOut();
                          }}
                        >
                          <IconLogout className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 