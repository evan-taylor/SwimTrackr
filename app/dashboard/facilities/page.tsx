'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconMapPin,
  IconEdit,
  IconTrash,
  IconPlus,
  IconUsers,
  IconCalendar,
  IconSwimming,
} from '@tabler/icons-react';

// Define types
type Facility = Database['public']['Tables']['facilities']['Row'] & {
  instructors_count: number;
  students_count: number;
  sessions_count: number;
  program_package: { name: string } | null;
};

export default function FacilitiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [addFacilityModalOpen, setAddFacilityModalOpen] = useState(false);
  
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    async function fetchFacilities() {
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
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        setUserRole(profile.role);
        
        // Only admins and managers should access this page
        if (profile.role !== 'admin' && profile.role !== 'manager') {
          router.push('/dashboard');
          return;
        }
        
        // Build query
        let query = supabase
          .from('facilities')
          .select(`
            *,
            instructors_count:profiles(count),
            students_count:students(count),
            sessions_count:sessions(count),
            program_package:program_packages(name)
          `);
          
        if (profile.role === 'manager') {
          // Managers only see their own facility
          const { data: managerFacilities } = await supabase
            .from('user_facilities')
            .select('facility_id')
            .eq('profile_id', user.id);
            
          if (managerFacilities && managerFacilities.length > 0) {
            const facilityIds = managerFacilities.map(f => f.facility_id);
            query = query.in('id', facilityIds);
          } else {
            // No facilities assigned
            setFacilities([]);
            setLoading(false);
            return;
          }
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        // Transform data
        const transformedData = data.map(facility => ({
          ...facility,
          instructors_count: facility.instructors_count?.[0]?.count || 0,
          students_count: facility.students_count?.[0]?.count || 0,
          sessions_count: facility.sessions_count?.[0]?.count || 0,
        })) as Facility[];
        
        setFacilities(transformedData);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFacilities();
  }, [supabase, router]);
  
  const filteredFacilities = facilities.filter(facility => 
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (facility.address && facility.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleDeleteFacility = async (facilityId: string) => {
    if (!confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', facilityId);
        
      if (error) {
        throw error;
      }
      
      // Update the state
      setFacilities(facilities.filter(f => f.id !== facilityId));
    } catch (error) {
      console.error('Error deleting facility:', error);
      alert('Failed to delete facility. Please try again.');
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facilities Management</h1>
        
        {userRole === 'admin' && (
          <button
            onClick={() => setAddFacilityModalOpen(true)}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <IconPlus className="inline-block mr-1 h-4 w-4" />
            Add New Facility
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="max-w-md">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconBuilding className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading facilities...</p>
          </div>
        </div>
      ) : (
        <>
          {filteredFacilities.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">No facilities found.</p>
              {userRole === 'admin' && (
                <button
                  onClick={() => setAddFacilityModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Add your first facility
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => (
                <div key={facility.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{facility.name}</h2>
                      {facility.is_public && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Public
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start text-sm">
                        <IconMail className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{facility.contact_email}</span>
                      </div>
                      
                      {facility.phone && (
                        <div className="flex items-start text-sm">
                          <IconPhone className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{facility.phone}</span>
                        </div>
                      )}
                      
                      {facility.address && (
                        <div className="flex items-start text-sm">
                          <IconMapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{facility.address}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="flex items-center justify-center mb-1">
                          <IconUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{facility.instructors_count}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Instructors</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="flex items-center justify-center mb-1">
                          <IconSwimming className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{facility.students_count}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="flex items-center justify-center mb-1">
                          <IconCalendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{facility.sessions_count}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Program:</span>
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">
                          {facility.program_package?.name || 'Not assigned'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tier:</span>
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {facility.subscription_tier}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750 flex justify-between">
                    <Link
                      href={`/dashboard/facilities/${facility.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    
                    <div className="space-x-2">
                      {userRole === 'admin' && (
                        <>
                          <button
                            onClick={() => router.push(`/dashboard/facilities/edit/${facility.id}`)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            <IconEdit className="inline-block mr-1 h-4 w-4" />
                            Edit
                          </button>
                          
                          <button
                            onClick={() => handleDeleteFacility(facility.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                          >
                            <IconTrash className="inline-block mr-1 h-4 w-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Placeholder for add facility modal */}
      {addFacilityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Facility</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Modal implementation would go here with form fields for facility details.
            </p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setAddFacilityModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => setAddFacilityModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 