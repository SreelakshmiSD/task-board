'use client';

import { useState, useEffect, useCallback } from 'react';
import { taskManagementServices, Task, Project, ApiResponse, ApiStage, ApiStatus, ApiPriority, ApiTeamMember } from '../services/taskManagementServices';

// Demo data for when API is not available
const demoTasks: Task[] = [
  {
    id: 1,
    title: 'Mobile App Redesign',
    description: 'Updating UI components and improving user flow',
    status: 'ongoing',
    stage: 'design',
    priority: 'high',
    assigned_to: ['user1', 'user2'],
    project: 'Mobile App',
    tags: ['Product', 'Design'],
    progress: 75,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'User Testing',
    description: 'Conduct usability tests with target users',
    status: 'pending',
    stage: 'design',
    priority: 'medium',
    assigned_to: ['user3'],
    project: 'Mobile App',
    tags: ['Product', 'Research'],
    progress: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    title: 'Homepage HTML Structure',
    description: 'Create semantic HTML structure for the homepage',
    status: 'ongoing',
    stage: 'html',
    priority: 'high',
    assigned_to: ['user2'],
    project: 'Website',
    tags: ['Frontend', 'HTML'],
    progress: 60,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    title: 'API Integration',
    description: 'Connect frontend with backend API endpoints',
    status: 'ongoing',
    stage: 'development',
    priority: 'high',
    assigned_to: ['user1', 'user4'],
    project: 'Mobile App',
    tags: ['Backend', 'API'],
    progress: 40,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 5,
    title: 'Unit Testing',
    description: 'Write comprehensive unit tests for core functionality',
    status: 'completed',
    stage: 'qa',
    priority: 'medium',
    assigned_to: ['user3', 'user4'],
    project: 'Mobile App',
    tags: ['Testing', 'QA'],
    progress: 100,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
];

const demoProjects: Project[] = [
  {
    id: 1,
    name: 'Mobile App',
    description: 'Mobile application development project',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Website',
    description: 'Company website redesign project',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
];
import { authUtils } from '../utils/api-config';

interface UseTaskManagementOptions {
  autoFetch?: boolean;
  userId?: string; // Deprecated: use email instead
  email?: string;
  dateRange?: { startDate: Date | null, endDate: Date | null };
}

interface UseTaskManagementReturn {
  // Data
  tasks: Task[];
  projects: Project[];
  stages: ApiStage[];
  statuses: ApiStatus[];
  priorities: ApiPriority[];
  teamMembers: ApiTeamMember[];

  // Loading states
  loading: boolean;
  tasksLoading: boolean;
  projectsLoading: boolean;
  stagesLoading: boolean;
  statusesLoading: boolean;
  prioritiesLoading: boolean;
  teamMembersLoading: boolean;

  // Error states
  error: string | null;
  tasksError: string | null;
  projectsError: string | null;
  stagesError: string | null;
  statusesError: string | null;
  prioritiesError: string | null;
  teamMembersError: string | null;
  
  // Grouped data
  groupedByStatus: {
    pending: Task[];
    ongoing: Task[];
    completed: Task[];
  };
  groupedByStage: {
    design: Task[];
    html: Task[];
    development: Task[];
    qa: Task[];
  };
  
  // Statistics
  statistics: {
    total: number;
    byStatus: Record<string, number>;
    byStage: Record<string, number>;
    byPriority: Record<string, number>;
    completionRate: number;
  };
  
  // Actions
  refetch: () => Promise<void>;
  refetchTasks: () => Promise<void>;
  refetchProjects: () => Promise<void>;
  
  // Task operations
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  
  // Utility functions
  filterByProject: (projectName: string) => Task[];
  searchTasks: (query: string) => Task[];
}

export const useTaskManagement = (options: UseTaskManagementOptions = {}): UseTaskManagementReturn => {
  console.log('🎯 useTaskManagement hook called with options:', options);
  const { autoFetch = false, userId: providedUserId, email: providedEmail, dateRange } = options;
  
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<ApiStage[]>([]);
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [priorities, setPriorities] = useState<ApiPriority[]>([]);
  const [teamMembers, setTeamMembers] = useState<ApiTeamMember[]>([]);

  // Loading states
  const [tasksLoading, setTasksLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [prioritiesLoading, setPrioritiesLoading] = useState(false);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);

  // Error states
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [stagesError, setStagesError] = useState<string | null>(null);
  const [statusesError, setStatusesError] = useState<string | null>(null);
  const [prioritiesError, setPrioritiesError] = useState<string | null>(null);
  const [teamMembersError, setTeamMembersError] = useState<string | null>(null);

  // Computed states
  const loading = tasksLoading || projectsLoading || stagesLoading || statusesLoading || prioritiesLoading || teamMembersLoading;
  const error = tasksError || projectsError || stagesError || statusesError || prioritiesError || teamMembersError;
  
  // Get user ID
  const getUserId = useCallback(() => {
    return providedUserId || authUtils.getUserId();
  }, [providedUserId]);
  
  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    console.log('🚀 fetchTasks - Starting with providedEmail:', providedEmail, 'dateRange:', dateRange);
    setTasksLoading(true);
    setTasksError(null);

    try {
      // Use provided email or let the service get it from session
      const response = await taskManagementServices.getTasksList(providedEmail, dateRange);
      console.log('📥 fetchTasks - API response:', {
        status: response.status,
        recordsCount: response.records?.length || 0,
        message: response.message
      });

      if (response.status === 'success') {
        console.log('✅ fetchTasks - Setting tasks:', response.records.length);
        console.log('✅ fetchTasks - First task sample:', response.records[0]);
        setTasks(response.records);
        console.log('✅ fetchTasks - Tasks state should be updated');
      } else {
        console.log('❌ fetchTasks - API error:', response.message);
        setTasksError(response.message);
        setTasks([]);
      }
    } catch (error) {
      console.log('💥 fetchTasks - Exception caught:', error);
      setTasksError('API not available - using demo data');
      setTasks(demoTasks);
    } finally {
      setTasksLoading(false);
    }
  }, [providedEmail, dateRange]);
  
  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);

    try {
      // Use provided email or let the service get it from session
      const response = await taskManagementServices.getProjectsList(providedEmail, dateRange);

      if (response.status === 'success') {
        setProjects(response.records);
      } else {
        setProjectsError(response.message);
        setProjects([]);
      }
    } catch (error) {
      setProjectsError('API not available - using demo data');
      setProjects(demoProjects);
    } finally {
      setProjectsLoading(false);
    }
  }, [providedEmail, dateRange]);

  // Fetch stages
  const fetchStages = useCallback(async () => {
    setStagesLoading(true);
    setStagesError(null);

    try {
      const response = await taskManagementServices.getStagesList();

      if (response.status === 'success') {
        setStages(response.records);
      } else {
        setStagesError(response.message);
        setStages(response.records); // Use fallback data
      }
    } catch (error) {
      setStagesError('Failed to fetch stages');
      // Set fallback stages
      setStages([
        { id: 47, title: 'Design' },
        { id: 48, title: 'HTML' },
        { id: 49, title: 'Development' },
        { id: 51, title: 'QA' }
      ]);
    } finally {
      setStagesLoading(false);
    }
  }, []);

  // Fetch statuses
  const fetchStatuses = useCallback(async () => {
    setStatusesLoading(true);
    setStatusesError(null);

    try {
      const response = await taskManagementServices.getStatusList();

      if (response.status === 'success') {
        setStatuses(response.records);
      } else {
        setStatusesError(response.message);
        setStatuses(response.records); // Use fallback data
      }
    } catch (error) {
      setStatusesError('Failed to fetch statuses');
      // Set fallback statuses
      setStatuses([
        { id: '1', name: 'Pending' },
        { id: '2', name: 'On-going' },
        { id: '3', name: 'Completed' }
      ]);
    } finally {
      setStatusesLoading(false);
    }
  }, []);

  // Fetch priorities
  const fetchPriorities = useCallback(async () => {
    setPrioritiesLoading(true);
    setPrioritiesError(null);

    try {
      const response = await taskManagementServices.getPrioritiesList();

      if (response.status === 'success') {
        setPriorities(response.records);
      } else {
        setPrioritiesError(response.message);
        setPriorities(response.records); // Use fallback data
      }
    } catch (error) {
      setPrioritiesError('Failed to fetch priorities');
      // Set fallback priorities
      setPriorities([
        { id: '1', name: 'Low' },
        { id: '2', name: 'Medium' },
        { id: '3', name: 'High' }
      ]);
    } finally {
      setPrioritiesLoading(false);
    }
  }, []);

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    setTeamMembersLoading(true);
    setTeamMembersError(null);

    try {
      const response = await taskManagementServices.getTeamMembersList(providedEmail);

      if (response.status === 'success') {
        setTeamMembers(response.records);
      } else {
        setTeamMembersError(response.message);
        setTeamMembers([]);
      }
    } catch (error) {
      setTeamMembersError('Failed to fetch team members');
      setTeamMembers([]);
    } finally {
      setTeamMembersLoading(false);
    }
  }, [providedEmail]);

  // Refetch all data
  const refetch = useCallback(async () => {
    console.log('🔄 refetch called with email:', providedEmail, 'dateRange:', dateRange);
    await Promise.all([
      fetchTasks(),
      fetchProjects(),
      fetchStages(),
      fetchStatuses(),
      fetchPriorities(),
      fetchTeamMembers()
    ]);
  }, [fetchTasks, fetchProjects, fetchStages, fetchStatuses, fetchPriorities, fetchTeamMembers, providedEmail, dateRange]);
  
  // Create task
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const response = await taskManagementServices.createTask(taskData);

      if (response.status === 'success') {
        // Check if this is a mock response (contains "mock response" in the message)
        const isMockResponse = response.message.toLowerCase().includes('mock response');

        console.log('🔍 Task creation response analysis:', {
          status: response.status,
          message: response.message,
          isMockResponse: isMockResponse
        });

        if (isMockResponse) {
          // For mock responses, add the task to local state immediately
          // Map numeric IDs to proper string values
          const getStatusName = (statusId: any): string => {
            if (typeof statusId === 'string') return statusId;
            const statusMap: { [key: string]: string } = {
              '1': 'pending',
              '2': 'ongoing',
              '3': 'completed'
            };
            return statusMap[statusId?.toString()] || 'pending';
          };

          const getStageName = (stageId: any): string => {
            if (typeof stageId === 'string') return stageId;
            const stageMap: { [key: string]: string } = {
              '47': 'design',
              '48': 'html',
              '49': 'development',
              '51': 'qa'
            };
            return stageMap[stageId?.toString()] || 'design';
          };

          const getPriorityName = (priorityId: any): string => {
            if (typeof priorityId === 'string') return priorityId;
            const priorityMap: { [key: string]: string } = {
              '1': 'low',
              '2': 'medium',
              '3': 'high'
            };
            return priorityMap[priorityId?.toString()] || 'medium';
          };

          const mockTask: Task = {
            id: Math.floor(Math.random() * 10000) + 1000,
            title: taskData.title,
            description: taskData.description || '',
            status: getStatusName(taskData.status),
            stage: getStageName(taskData.stage),
            priority: getPriorityName(taskData.priority),
            assigned_to: taskData.assigned_to || [],
            project: typeof taskData.project === 'string' ? taskData.project : taskData.project?.name || 'Unknown',
            tags: [],
            progress: 0,
            due_date: taskData.due_date || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log('🔍 Mock task creation debug:', {
            originalStage: taskData.stage,
            mappedStage: getStageName(taskData.stage),
            originalStatus: taskData.status,
            mappedStatus: getStatusName(taskData.status)
          });

          // Add the mock task to the current tasks list
          setTasks(prevTasks => [...prevTasks, mockTask]);
          console.log('✅ Mock task added to local state:', mockTask);
        } else {
          // For real API responses, refresh the tasks list
          await fetchTasks();
        }

        return true;
      } else {
        setTasksError(response.message);
        return false;
      }
    } catch (error) {
      setTasksError('Failed to create task');
      return false;
    }
  }, [fetchTasks]);
  
  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      const response = await taskManagementServices.updateTask(taskId, updates);
      
      if (response.status === 'success') {
        // Update local state optimistically
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id.toString() === taskId 
              ? { ...task, ...updates }
              : task
          )
        );
        return true;
      } else {
        setTasksError(response.message);
        return false;
      }
    } catch (error) {
      setTasksError('Failed to update task');
      return false;
    }
  }, []);
  
  // Delete task
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const response = await taskManagementServices.deleteTask(taskId);
      
      if (response.status === 'success') {
        // Remove from local state
        setTasks(prevTasks => 
          prevTasks.filter(task => task.id.toString() !== taskId)
        );
        return true;
      } else {
        setTasksError(response.message);
        return false;
      }
    } catch (error) {
      setTasksError('Failed to delete task');
      return false;
    }
  }, []);
  
  // Utility functions
  const filterByProject = useCallback((projectName: string): Task[] => {
    return taskManagementServices.filterTasksByProject(tasks, projectName);
  }, [tasks]);
  
  const searchTasks = useCallback((query: string): Task[] => {
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task =>
      task.title?.toLowerCase().includes(lowercaseQuery) ||
      task.description?.toLowerCase().includes(lowercaseQuery) ||
      (task.tags && Array.isArray(task.tags) && task.tags.some(tag => tag?.toLowerCase().includes(lowercaseQuery)))
    );
  }, [tasks]);
  
  // Computed data
  console.log('🔧 useTaskManagement - Computing grouped data with tasks:', tasks.length);
  if (tasks.length > 0) {
    console.log('📋 useTaskManagement - First task sample:', tasks[0]);
    console.log('📋 useTaskManagement - First task status:', tasks[0].status);
    console.log('📋 useTaskManagement - First task stage:', tasks[0].stage);
  }
  const groupedByStatus = taskManagementServices.groupTasksByStatus(tasks);
  const groupedByStage = taskManagementServices.groupTasksByStage(tasks);
  const statistics = taskManagementServices.getTaskStatistics(tasks);

  console.log('📊 useTaskManagement - Grouped by status result:', {
    pending: groupedByStatus.pending.length,
    ongoing: groupedByStatus.ongoing.length,
    completed: groupedByStatus.completed.length
  });

  console.log('📊 useTaskManagement - Grouped by stage result:', {
    design: groupedByStage.design.length,
    html: groupedByStage.html.length,
    development: groupedByStage.development.length,
    qa: groupedByStage.qa.length
  });
  
  // Auto-fetch when we have an email (either on mount or when email becomes available)
  useEffect(() => {
    console.log('🔍 Auto-fetch useEffect triggered:', { autoFetch, providedEmail });
    // TEMPORARILY DISABLED TO PREVENT INFINITE LOOP
    // if (autoFetch && providedEmail) {
    //   console.log('🚀 Auto-fetching with email:', providedEmail);
    //   refetch();
    // } else {
    //   console.log('🚫 Auto-fetch conditions not met:', { autoFetch, providedEmail });
    // }
    console.log('⚠️ Auto-fetch temporarily disabled to prevent infinite loop');
  }, [autoFetch, providedEmail]); // Removed refetch from dependencies to prevent infinite loop

  // Also fetch when email becomes available for the first time
  useEffect(() => {
    console.log('🔍 Email availability useEffect triggered:', { providedEmail, tasksLength: tasks.length, tasksLoading });
    // TEMPORARILY DISABLED TO PREVENT INFINITE LOOP
    // if (providedEmail && !tasks.length && !tasksLoading) {
    //   console.log('🔄 Email became available, fetching tasks:', providedEmail);
    //   refetch();
    // } else {
    //   console.log('🚫 Email availability conditions not met:', { providedEmail, tasksLength: tasks.length, tasksLoading });
    // }
    console.log('⚠️ Email availability auto-fetch temporarily disabled to prevent infinite loop');
  }, [providedEmail, tasks.length, tasksLoading]); // Removed refetch from dependencies to prevent infinite loop
  
  return {
    // Data
    tasks,
    projects,
    stages,
    statuses,
    priorities,
    teamMembers,

    // Loading states
    loading,
    tasksLoading,
    projectsLoading,
    stagesLoading,
    statusesLoading,
    prioritiesLoading,
    teamMembersLoading,

    // Error states
    error,
    tasksError,
    projectsError,
    stagesError,
    statusesError,
    prioritiesError,
    teamMembersError,

    // Grouped data
    groupedByStatus,
    groupedByStage,

    // Statistics
    statistics,

    // Actions
    refetch,
    refetchTasks: fetchTasks,
    refetchProjects: fetchProjects,

    // Task operations
    createTask,
    updateTask,
    deleteTask,

    // Utility functions
    filterByProject,
    searchTasks,
  };
};

export default useTaskManagement;
