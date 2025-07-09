// Export all services
export { taskManagementServices, errorHandler } from './services/taskManagementServices';
export type { Task, Project, ApiResponse, ApiTeamMember } from './services/taskManagementServices';

// Export hooks
export { useTaskManagement } from './hooks/useTaskManagement';
export type { default as UseTaskManagementReturn } from './hooks/useTaskManagement';

// Export utilities
export { axiosInstance, authUtils, errorUtils, retryRequest, API_CONFIG } from './utils/api-config';

// Export components
export { TaskBoard } from './components/TaskBoard';

// Re-export everything for convenience
export * from './services/taskManagementServices';
export * from './hooks/useTaskManagement';
export * from './utils/api-config';
export * from './components/TaskBoard';
