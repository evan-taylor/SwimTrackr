'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import Link from 'next/link';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';

// Define types
type Level = Database['public']['Tables']['levels']['Row'] & {
  tasks_count: number;
};

type Task = Database['public']['Tables']['tasks']['Row'];

export default function SkillsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<Level[]>([]);
  const [tasks, setTasks] = useState<{ [levelId: string]: Task[] }>({});
  const [expandedLevels, setExpandedLevels] = useState<{ [levelId: string]: boolean }>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [programPackageId, setProgramPackageId] = useState<string | null>(null);
  const [addLevelModalOpen, setAddLevelModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchLevelsAndTasks() {
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

        // Get facility's program package
        if (profile.facility_id) {
          const { data: facility } = await supabase
            .from('facilities')
            .select('program_package_id')
            .eq('id', profile.facility_id)
            .single();

          if (facility?.program_package_id) {
            setProgramPackageId(facility.program_package_id);
          }
        }

        // Build the query based on user role
        let query = supabase
          .from('levels')
          .select(`
            *,
            tasks_count:tasks(count)
          `)
          .order('order_index', { ascending: true });

        // Apply role-based filters
        if (profile.role !== 'admin') {
          if (profile.role === 'manager' || profile.role === 'instructor') {
            if (profile.facility_id) {
              // Get facility's program package id
              const { data: facility } = await supabase
                .from('facilities')
                .select('program_package_id')
                .eq('id', profile.facility_id)
                .single();

              if (facility?.program_package_id) {
                query = query.eq('program_package_id', facility.program_package_id);
              }
            }
          }
        }

        const { data, error: levelsError } = await query;

        if (levelsError) {
          throw levelsError;
        }

        // Transform data
        const transformedLevels = data.map(level => ({
          ...level,
          tasks_count: level.tasks_count?.[0]?.count || 0
        })) as Level[];

        setLevels(transformedLevels);

        // Initialize all levels as collapsed
        const initialExpandedState: { [levelId: string]: boolean } = {};
        transformedLevels.forEach(level => {
          initialExpandedState[level.id] = false;
        });
        setExpandedLevels(initialExpandedState);

      } catch (error: any) {
        console.error('Error fetching levels and tasks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLevelsAndTasks();
  }, [supabase, router]);

  const fetchTasksForLevel = async (levelId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('level_id', levelId)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      setTasks(prev => ({
        ...prev,
        [levelId]: data as Task[]
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const toggleLevelExpansion = async (levelId: string) => {
    // If we're expanding and don't have tasks yet, fetch them
    if (!expandedLevels[levelId] && (!tasks[levelId] || tasks[levelId].length === 0)) {
      await fetchTasksForLevel(levelId);
    }

    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };

  const handleLevelOrderChange = async (levelId: string, direction: 'up' | 'down') => {
    if (!levels.length) return;

    const currentIndex = levels.findIndex(level => level.id === levelId);
    if (currentIndex === -1) return;

    const adjacentIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (adjacentIndex < 0 || adjacentIndex >= levels.length) return;

    // Swap order_index values
    const updatedLevels = [...levels];
    const tempOrderIndex = updatedLevels[currentIndex].order_index;
    updatedLevels[currentIndex].order_index = updatedLevels[adjacentIndex].order_index;
    updatedLevels[adjacentIndex].order_index = tempOrderIndex;

    // Update in database
    try {
      await Promise.all([
        supabase
          .from('levels')
          .update({ order_index: updatedLevels[currentIndex].order_index })
          .eq('id', updatedLevels[currentIndex].id),
        supabase
          .from('levels')
          .update({ order_index: updatedLevels[adjacentIndex].order_index })
          .eq('id', updatedLevels[adjacentIndex].id)
      ]);

      // Sort by order_index and update state
      updatedLevels.sort((a, b) => a.order_index - b.order_index);
      setLevels(updatedLevels);
    } catch (error) {
      console.error('Error updating level order:', error);
    }
  };

  const canEditContent = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skills & Levels Management</h1>
        {canEditContent && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setAddLevelModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              <IconPlus className="inline-block mr-1 h-4 w-4" />
              Add New Level
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading skills and levels...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
          {levels.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">No levels found.</p>
              {canEditContent && (
                <button
                  onClick={() => setAddLevelModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Create your first level
                </button>
              )}
            </div>
          ) : (
            <>
              {levels.map((level, index) => (
                <div key={level.id} className="divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="p-4 bg-gray-50 dark:bg-gray-750 flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <button
                        onClick={() => toggleLevelExpansion(level.id)}
                        className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-expanded={expandedLevels[level.id]}
                      >
                        {expandedLevels[level.id] ? (
                          <IconChevronDown className="h-5 w-5" />
                        ) : (
                          <IconChevronRight className="h-5 w-5" />
                        )}
                        <span className="sr-only">
                          {expandedLevels[level.id] ? 'Collapse' : 'Expand'}
                        </span>
                      </button>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {level.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {level.tasks_count} skills
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {canEditContent && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedLevel(level);
                              setAddTaskModalOpen(true);
                            }}
                            className="px-2 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                            title="Add task to this level"
                          >
                            <IconPlus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {/* Handle edit level */}}
                            className="px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            title="Edit level"
                          >
                            <IconEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {/* Handle delete level */}}
                            className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                            title="Delete level"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                          <div className="flex flex-col">
                            <button
                              disabled={index === 0}
                              onClick={() => handleLevelOrderChange(level.id, 'up')}
                              className={`px-1 py-0.5 text-sm ${
                                index === 0
                                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                              }`}
                              title="Move up"
                            >
                              <IconArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              disabled={index === levels.length - 1}
                              onClick={() => handleLevelOrderChange(level.id, 'down')}
                              className={`px-1 py-0.5 text-sm ${
                                index === levels.length - 1
                                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                              }`}
                              title="Move down"
                            >
                              <IconArrowDown className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {expandedLevels[level.id] && (
                    <div className="p-4">
                      {level.description && (
                        <div className="mb-4 text-gray-600 dark:text-gray-300">
                          {level.description}
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Skills/Tasks:</h4>
                        
                        {!tasks[level.id] ? (
                          <div className="text-center py-6">
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading tasks...</p>
                          </div>
                        ) : tasks[level.id].length === 0 ? (
                          <div className="text-center py-4 border border-gray-100 dark:border-gray-700 rounded">
                            <p className="text-gray-500 dark:text-gray-400">No tasks found for this level.</p>
                            {canEditContent && (
                              <button
                                onClick={() => {
                                  setSelectedLevel(level);
                                  setAddTaskModalOpen(true);
                                }}
                                className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Add your first task
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Task Name
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Description
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Order
                                  </th>
                                  {canEditContent && (
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {tasks[level.id].map((task) => (
                                  <tr key={task.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                      {task.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                      {task.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {task.order_index}
                                    </td>
                                    {canEditContent && (
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                          onClick={() => {/* Handle edit task */}}
                                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => {/* Handle delete task */}}
                                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
      
      {/* Placeholder for modals - in a real app, implement proper modal components */}
      {addLevelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Level</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Modal implementation would go here with form fields for name, description, etc.</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setAddLevelModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => setAddLevelModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {addTaskModalOpen && selectedLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Task to {selectedLevel.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Modal implementation would go here with form fields for task name, description, etc.</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setAddTaskModalOpen(false);
                  setSelectedLevel(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setAddTaskModalOpen(false);
                  setSelectedLevel(null);
                }}
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