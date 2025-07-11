import { AxiosError } from 'axios';
import { axiosInstance } from '../utils/api-config';
import { getSession } from 'next-auth/react';

// API Response interfaces
export interface ApiTaskStage {
  id: number;
  value: string;
}

export interface ApiTaskStatus {
  id: number;
  value: string;
}

export interface ApiTaskPriority {
  id: number;
  value: string;
}

export interface ApiTaskProject {
  id: number;
  value: string;
}

export interface ApiTaskType {
  id: number;
  value: string;
}

export interface ApiTaskAssignee {
  id: number;
  name: string;
  email: string;
  profile_pic: string;
}

export interface ApiTeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_pic?: string;
  company: {
    id: number;
    value: string;
  } | null;
}

export interface ApiStage {
  id: number;
  title: string;
}

export interface ApiStatus {
  id: string;
  name: string;
}

export interface ApiPriority {
  id: string;
  name: string;
}

export interface ApiPriority {
  id: string;
  name: string;
}

// Subtask interfaces
export interface SubTaskStatus {
  id: number;
  value: string;
}

export interface SubTaskCreatedBy {
  id: number;
  name: string;
  email: string;
  profile_pic: string;
}

export interface SubTask {
  id: number;
  name: string;
  status: SubTaskStatus;
  created_by: SubTaskCreatedBy;
  created_at: string;
}

// Task interfaces
export interface Task {
  id: number;
  title: string;
  description: string;
  status: ApiTaskStatus | 'pending' | 'ongoing' | 'completed';
  stage: ApiTaskStage | 'design' | 'html' | 'development' | 'qa';
  priority: ApiTaskPriority | 'low' | 'medium' | 'high';
  assigned_to?: string[];
  assignees?: ApiTaskAssignee[];
  project: ApiTaskProject | string;
  task_type?: ApiTaskType;
  tags?: string[];
  progress?: number;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  sub_tasks?: SubTask[];
  color?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'failure';
  message: string;
  records: T;
}

// Helper function to get authenticated user's email
export const getAuthenticatedUserEmail = async (): Promise<string | null> => {
  try {
    const session = await getSession();
    return session?.user?.email || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Error handler following your pattern
export const errorHandler = (error: AxiosError) => {
  return {
    result: "failure" as const,
    records: [],
    error: error?.response?.data,
    status: error?.response?.status
  };
};

// Helper function to format date range for API
const formatDateRange = (startDate: Date | null, endDate: Date | null): string | undefined => {
  if (!startDate || !endDate) return undefined;

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  return `${formatDate(startDate)} to ${formatDate(endDate)}`;
};

// Task Management Services
export const taskManagementServices = {

  // Get all tasks for a user by email with optional date range
  getTasksList: async (email?: string, dateRange?: { startDate: Date | null, endDate: Date | null }): Promise<ApiResponse<Task[]>> => {
    try {
      // Use provided email or get from authenticated session
      const userEmail = email || await getAuthenticatedUserEmail();

      if (!userEmail) {
        return {
          status: 'failure',
          message: 'No authenticated user email found',
          records: []
        };
      }

      // Build request parameters
      const params: any = {
        email: userEmail
      };

      // Add date range if provided
      if (dateRange) {
        const formattedDateRange = formatDateRange(dateRange.startDate, dateRange.endDate);
        if (formattedDateRange) {
          params.date_range = formattedDateRange;
        }
      }

      const response = await axiosInstance.get('/tasks-list', {
        params
      });
      
      if (response.data.status === 'success') {
        return {
          status: 'success',
          message: response.data.message || 'Tasks fetched successfully',
          records: response.data.records || []
        };
      } else {
        return {
          status: 'failure',
          message: response.data.message || 'Failed to fetch tasks',
          records: []
        };
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);

      // Check if it's a timeout error
      const axiosError = error as AxiosError;
      const isTimeout = (error instanceof Error && error.message.includes('timeout')) ||
                       (axiosError.code === 'ECONNABORTED');
      const isNetworkError = !axiosError.response;

      if (isTimeout || isNetworkError) {
        console.warn('API timeout or network error - falling back to demo data');
        return {
          status: 'failure',
          message: 'API timeout - using demo data',
          records: []
        };
      }

      return {
        status: 'failure',
        message: 'Network error occurred while fetching tasks',
        records: []
      };
    }
  },

  // Get projects list by email with optional date range
  getProjectsList: async (email?: string, dateRange?: { startDate: Date | null, endDate: Date | null }): Promise<ApiResponse<Project[]>> => {
    try {
      // Use provided email or get from authenticated session
      const userEmail = email || await getAuthenticatedUserEmail();

      if (!userEmail) {
        return {
          status: 'failure',
          message: 'No authenticated user email found',
          records: []
        };
      }

      // Build request parameters
      const params: any = {
        email: userEmail
      };

      // Add date range if provided
      if (dateRange) {
        const formattedDateRange = formatDateRange(dateRange.startDate, dateRange.endDate);
        if (formattedDateRange) {
          params.date_range = formattedDateRange;
        }
      }

      const response = await axiosInstance.get('/project-list', {
        params
      });
      
      if (response.data.status === 'success') {
        return {
          status: 'success',
          message: response.data.message || 'Projects fetched successfully',
          records: response.data.records || []
        };
      } else {
        return {
          status: 'failure',
          message: response.data.message || 'Failed to fetch projects',
          records: []
        };
      }
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      console.error('❌ Error details:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });

      return {
        status: 'failure',
        message: 'Network error occurred while fetching projects',
        records: []
      };
    }
  },

  // Create new task
  createTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Task>> => {
    try {
      // Get authenticated user email
      const userEmail = await getAuthenticatedUserEmail();

      if (!userEmail) {
        return {
          status: 'failure',
          message: 'No authenticated user email found',
          records: {} as Task
        };
      }

      // Prepare data for the create-task-common endpoint
      const createTaskData = {
        email: userEmail,
        title: taskData.title,
        description: taskData.description || '',
        project: typeof taskData.project === 'object' ? taskData.project.id : taskData.project,
        status: typeof taskData.status === 'object' ? taskData.status.id : taskData.status,
        stage: typeof taskData.stage === 'object' ? taskData.stage.id : taskData.stage,
        priority: typeof taskData.priority === 'object' ? taskData.priority.id : taskData.priority,
        assigned_to: taskData.assigned_to || [],
        due_date: taskData.due_date || null
      };

      // Call the create-task API route
      const response = await axiosInstance.post('/create-task', createTaskData);
      console.log("williom -----------------------create task response:", response);

      // Check for both 'status' and 'result' fields for success
      const isSuccess = response.data.status === 'success' || response.data.result === 'success';

      if (isSuccess) {
        return {
          status: 'success',
          message: response.data.message || 'Task created successfully via real API',
          records: response.data.records || response.data.task || {}
        };
      } else {
        return {
          status: 'failure',
          message: response.data.message || 'Failed to create task',
          records: {} as Task
        };
      }
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        status: 'failure',
        message: 'Network error occurred while creating task',
        records: {} as Task
      };
    }
  },

  // Update task
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> => {
    try {
      const response = await axiosInstance.put(`/tasks/${taskId}/`, updates);
      
      if (response.data.status === 'success') {
        return {
          status: 'success',
          message: response.data.message || 'Task updated successfully',
          records: response.data.records
        };
      } else {
        return {
          status: 'failure',
          message: response.data.message || 'Failed to update task',
          records: {} as Task
        };
      }
    } catch (error) {
      console.error('Error updating task:', error);
      return {
        status: 'failure',
        message: 'Network error occurred while updating task',
        records: {} as Task
      };
    }
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await axiosInstance.delete(`/tasks/${taskId}/`);
      
      if (response.data.status === 'success') {
        return {
          status: 'success',
          message: response.data.message || 'Task deleted successfully',
          records: true
        };
      } else {
        return {
          status: 'failure',
          message: response.data.message || 'Failed to delete task',
          records: false
        };
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      return {
        status: 'failure',
        message: 'Network error occurred while deleting task',
        records: false
      };
    }
  },

  // Helper function to get status value
  getStatusValue: (status: ApiTaskStatus | string): string => {
    let value = '';
    if (typeof status === 'object' && status.value) {
      value = status.value.toLowerCase().trim();
    } else if (typeof status === 'string') {
      value = status.toLowerCase().trim();
    }

    // Map common variations to standard values
    if (value === 'on-going' || value === 'ongoing' || value === 'in progress') {
      value = 'ongoing';
    } else if (value === 'pending' || value === 'to-do' || value === 'todo') {
      value = 'pending';
    } else if (value === 'completed' || value === 'done' || value === 'finished') {
      value = 'completed';
    }

    // Log to both server and client console
    console.log('🔍 getStatusValue - input:', JSON.stringify(status), 'output:', value);
    return value;
  },

  // Helper function to get stage value
  getStageValue: (stage: ApiTaskStage | string): string => {
    let value = '';
    if (typeof stage === 'object' && stage.value) {
      value = stage.value.toLowerCase().trim();
    } else if (typeof stage === 'string') {
      value = stage.toLowerCase().trim();
    }

    // Map common variations to standard values
    if (value === 'development' || value === 'develop' || value === 'dev') {
      value = 'development';
    } else if (value === 'design' || value === 'ui' || value === 'ux') {
      value = 'design';
    } else if (value === 'html' || value === 'markup' || value === 'frontend') {
      value = 'html';
    } else if (value === 'qa' || value === 'testing' || value === 'test' || value === 'quality assurance') {
      value = 'qa';
    }

    // Log to both server and client console
    console.log('🔍 getStageValue - input:', JSON.stringify(stage), 'output:', value);
    return value;
  },

  // Group tasks by status
  groupTasksByStatus: (tasks: Task[]) => {
    console.log('🔍 Grouping tasks by status. Total tasks:', tasks.length);

    if (tasks.length > 0) {
      console.log('📋 Sample task status:', tasks[0].status);
      console.log('📋 Sample status value:', taskManagementServices.getStatusValue(tasks[0].status));

      // Log all unique status values
      const uniqueStatuses = [...new Set(tasks.map(task => taskManagementServices.getStatusValue(task.status)))];
      console.log('📋 All unique status values:', uniqueStatuses);
    }

    const grouped = {
      pending: tasks.filter(task => {
        const statusValue = taskManagementServices.getStatusValue(task.status);
        const matches = statusValue === 'pending';
        if (matches) console.log('✅ Pending task:', task.title, 'status:', statusValue);
        return matches;
      }),
      ongoing: tasks.filter(task => {
        const statusValue = taskManagementServices.getStatusValue(task.status);
        const matches = statusValue === 'ongoing';
        if (matches) console.log('✅ Ongoing task:', task.title, 'status:', statusValue);
        return matches;
      }),
      completed: tasks.filter(task => {
        const statusValue = taskManagementServices.getStatusValue(task.status);
        const matches = statusValue === 'completed';
        if (matches) console.log('✅ Completed task:', task.title, 'status:', statusValue);
        return matches;
      })
    };

    console.log('📊 Status grouped results:', {
      pending: grouped.pending.length,
      ongoing: grouped.ongoing.length,
      completed: grouped.completed.length
    });

    return grouped;
  },

  // Group tasks by stage
  groupTasksByStage: (tasks: Task[]) => {
    console.log('🔍 Grouping tasks by stage. Total tasks:', tasks.length);

    if (tasks.length > 0) {
      console.log('📋 Sample task:', tasks[0]);
      console.log('📋 Sample stage:', tasks[0].stage);
      console.log('📋 Sample stage value:', taskManagementServices.getStageValue(tasks[0].stage));

      // Log all unique stage values
      const uniqueStages = [...new Set(tasks.map(task => taskManagementServices.getStageValue(task.stage)))];
      console.log('📋 All unique stage values:', uniqueStages);
    }

    const grouped = {
      design: tasks.filter(task => {
        const stageValue = taskManagementServices.getStageValue(task.stage);
        const matches = stageValue === 'design';
        if (matches) console.log('✅ Design task:', task.title, 'stage:', stageValue);
        return matches;
      }),
      html: tasks.filter(task => {
        const stageValue = taskManagementServices.getStageValue(task.stage);
        const matches = stageValue === 'html';
        if (matches) console.log('✅ HTML task:', task.title, 'stage:', stageValue);
        return matches;
      }),
      development: tasks.filter(task => {
        const stageValue = taskManagementServices.getStageValue(task.stage);
        const matches = stageValue === 'development';
        if (matches) console.log('✅ Development task:', task.title, 'stage:', stageValue);
        return matches;
      }),
      qa: tasks.filter(task => {
        const stageValue = taskManagementServices.getStageValue(task.stage);
        const matches = stageValue === 'qa';
        if (matches) console.log('✅ QA task:', task.title, 'stage:', stageValue);
        return matches;
      })
    };

    console.log('📊 Grouped results:', {
      design: grouped.design.length,
      html: grouped.html.length,
      development: grouped.development.length,
      qa: grouped.qa.length
    });

    return grouped;
  },

  // Filter tasks by project
  filterTasksByProject: (tasks: Task[], projectName: string) => {
    return tasks.filter(task => task.project === projectName);
  },

  // Get task statistics
  getTaskStatistics: (tasks: Task[]) => {
    const total = tasks.length;
    const byStatus = {
      pending: tasks.filter(t => t.status === 'pending').length,
      ongoing: tasks.filter(t => t.status === 'ongoing').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
    const byStage = {
      design: tasks.filter(t => t.stage === 'design').length,
      html: tasks.filter(t => t.stage === 'html').length,
      development: tasks.filter(t => t.stage === 'development').length,
      qa: tasks.filter(t => t.stage === 'qa').length
    };
    const byPriority = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length
    };

    return {
      total,
      byStatus,
      byStage,
      byPriority,
      completionRate: total > 0 ? Math.round((byStatus.completed / total) * 100) : 0
    };
  },

  // Get team members list by email
  getTeamMembersList: async (email?: string): Promise<ApiResponse<ApiTeamMember[]>> => {
    try {
      // Use provided email or get from authenticated session
      const userEmail = email || await getAuthenticatedUserEmail();

      if (!userEmail) {
        return {
          status: 'failure',
          message: 'No authenticated user email found',
          records: []
        };
      }

      const response = await axiosInstance.get('/team-members-list', {
        params: {
          email: userEmail
        }
      });

      if (response.data.result === 'success' || response.data.status === 'success') {
        return {
          status: 'success',
          message: response.data.message || 'Team members fetched successfully',
          records: response.data.records || []
        };
      } else {
        return {
          status: 'failure',
          message: response.data.message || 'Failed to fetch team members',
          records: []
        };
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      return {
        status: 'failure',
        message: 'Network error occurred while fetching team members',
        records: []
      };
    }
  },

  // Get stages list from masters-list API
  getStagesList: async (projectId?: string): Promise<ApiResponse<ApiStage[]>> => {
    try {
      console.log('🔄 Fetching stages from masters-list API...', projectId ? `for project ${projectId}` : 'all stages');

      const params: any = {
        action: 'stage'
      };

      // Add project_id parameter if provided
      if (projectId) {
        params.project_id = projectId;
      }

      const response = await axiosInstance.get('/masters-list', {
        params
      });

      if (response.data.status === 'success') {
        console.log('✅ Stages fetched successfully:', response.data.records?.length || 0);
        return {
          status: 'success',
          message: response.data.message || 'Stages fetched successfully',
          records: response.data.records || []
        };
      } else {
        console.log('❌ Stages API error:', response.data.message);
        return {
          status: 'failure',
          message: response.data.message || 'Failed to fetch stages',
          records: []
        };
      }
    } catch (error) {
      console.error('❌ Error fetching stages:', error);

      // Fallback to default stages if API fails
      const fallbackStages: ApiStage[] = [
        { id: 47, title: 'Design' },
        { id: 48, title: 'HTML' },
        { id: 49, title: 'Development' },
        { id: 51, title: 'QA' }
      ];

      return {
        status: 'failure',
        message: 'Network error occurred while fetching stages - using fallback data',
        records: fallbackStages
      };
    }
  },

  // Get statuses list from masters-list API
  getStatusList: async (): Promise<ApiResponse<ApiStatus[]>> => {
    try {
      console.log('🔄 Fetching statuses from masters-list API...');

      const response = await axiosInstance.get('/masters-list', {
        params: {
          action: 'task_status'
        }
      });

      if (response.data.status === 'success') {
        console.log('✅ Statuses fetched successfully:', response.data.records?.length || 0);
        return {
          status: 'success',
          message: response.data.message || 'Statuses fetched successfully',
          records: response.data.records || []
        };
      } else {
        console.log('❌ Statuses API error:', response.data.message);
        return {
          status: 'failure',
          message: response.data.message || 'Failed to fetch statuses',
          records: []
        };
      }
    } catch (error) {
      console.error('❌ Error fetching statuses:', error);

      // Fallback to default statuses if API fails
      const fallbackStatuses: ApiStatus[] = [
        { id: '1', name: 'Pending' },
        { id: '2', name: 'On-going' },
        { id: '3', name: 'Completed' }
      ];

      return {
        status: 'failure',
        message: 'Network error occurred while fetching statuses - using fallback data',
        records: fallbackStatuses
      };
    }
  },

  // Get priorities list from masters-list API
  getPrioritiesList: async (): Promise<ApiResponse<ApiPriority[]>> => {
    try {
      console.log('🔄 Fetching priorities from masters-list API...');

      const response = await axiosInstance.get('/masters-list', {
        params: {
          action: 'task_priority'
        }
      });

      if (response.data.status === 'success') {
        console.log('✅ Priorities fetched successfully:', response.data.records?.length || 0);
        return {
          status: 'success',
          message: response.data.message || 'Priorities fetched successfully',
          records: response.data.records || []
        };
      } else {
        console.log('❌ Priorities API error:', response.data.message);
        return {
          status: 'failure',
          message: response.data.message || 'Failed to fetch priorities',
          records: []
        };
      }
    } catch (error) {
      console.error('❌ Error fetching priorities:', error);

      // Fallback to default priorities if API fails
      const fallbackPriorities: ApiPriority[] = [
        { id: '1', name: 'Low' },
        { id: '2', name: 'Medium' },
        { id: '3', name: 'High' }
      ];

      return {
        status: 'failure',
        message: 'Network error occurred while fetching priorities - using fallback data',
        records: fallbackPriorities
      };
    }
  }
};

export default taskManagementServices;
