'use client';

import React, { useState } from 'react';
import { useTaskManagement } from '../hooks/useTaskManagement';
import { useStages } from '../hooks/useStages';
import { useStatuses } from '../hooks/useStatuses';
import { Task } from '../services/taskManagementServices';

interface TaskBoardProps {
  userId?: string;
  viewMode?: 'status' | 'stage';
  showProjects?: boolean;
  selectedProject?: string;
  projects?: Array<{ id: string; name: string; }>;
  onProjectChange?: (project: string) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  userId,
  viewMode = 'status',
  showProjects = true,
  selectedProject = '',
  projects = [],
  onProjectChange
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    loading,
    error,
    groupedByStatus,
    groupedByStage,
    statistics,
    refetch,
    updateTask,
    deleteTask,
    searchTasks
  } = useTaskManagement({ autoFetch: true, userId });

  // Get selected project ID for stages filtering
  const selectedProjectId = selectedProject && selectedProject !== '' && selectedProject !== 'all'
    ? projects.find(p => p.name === selectedProject)?.id
    : undefined;

  // Fetch stages and statuses dynamically
  const stagesData = useStages({ projectId: selectedProjectId });
  const statusesData = useStatuses();
  const stages = stagesData.stages || [];
  const statuses = statusesData.statuses || [];

  // Get current groups based on view mode
  const currentGroups = viewMode === 'status' ? groupedByStatus : groupedByStage;
  const groupKeys = viewMode === 'status'
    ? statuses && statuses.length > 0
      ? statuses.map((status: any) => status.name.toLowerCase().replace(/\s+/g, '').replace('-', ''))
      : ['pending', 'ongoing', 'completed']
    : stages && stages.length > 0
      ? stages.map((stage: any) => stage.title.toLowerCase().replace(/\s+/g, ''))
      : ['design', 'html', 'development', 'qa'];

  // Type-safe function to get tasks from groups
  const getGroupTasks = (groupKey: string): Task[] => {
    if (viewMode === 'status') {
      const statusGroups = currentGroups as { [key: string]: Task[] };
      return statusGroups[groupKey] || [];
    } else {
      const stageGroups = currentGroups as { [key: string]: Task[] };
      return stageGroups[groupKey] || [];
    }
  };

  // Generate options for dropdowns
  const getStatusOptions = () => {
    if (statuses && statuses.length > 0) {
      return statuses.map((status: any) => ({
        value: status.name.toLowerCase().replace(/\s+/g, '').replace('-', ''),
        label: status.name
      }));
    }
    // Fallback to default statuses if API hasn't loaded yet
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'ongoing', label: 'On-going' },
      { value: 'completed', label: 'Completed' }
    ];
  };

  const getStageOptions = () => {
    if (stages && stages.length > 0) {
      return stages.map((stage: any) => ({
        value: stage.title.toLowerCase().replace(/\s+/g, ''),
        label: stage.title
      }));
    }
    // Fallback to default stages if API hasn't loaded yet
    return [
      { value: 'design', label: 'Design' },
      { value: 'html', label: 'HTML' },
      { value: 'development', label: 'Development' },
      { value: 'qa', label: 'QA' }
    ];
  };

  const options = viewMode === 'status' ? getStatusOptions() : getStageOptions();

  // Filter tasks based on selected project and search
  const getFilteredTasks = (groupTasks: Task[]) => {
    let filtered = groupTasks;
    
    if (selectedProject) {
      filtered = filtered.filter(task => task.project === selectedProject);
    }
    
    if (searchQuery) {
      const searchResults = searchTasks(searchQuery);
      filtered = filtered.filter(task => 
        searchResults.some(searchTask => searchTask.id === task.id)
      );
    }
    
    return filtered;
  };

  const handleTaskMove = async (taskId: string, newValue: string) => {
    const updateField = viewMode === 'status' ? 'status' : 'stage';
    await updateTask(taskId, { [updateField]: newValue });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Tasks</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with Controls */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Tasks by {viewMode === 'status' ? 'Status' : 'Stage'}
            </h2>
            <p className="text-gray-600">
              {statistics.total} total tasks • {statistics.completionRate}% completed
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Project Filter */}
          {showProjects && projects.length > 0 && (
            <div className="min-w-48">
              <select
                value={selectedProject}
                onChange={(e) => onProjectChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{statistics.byStatus.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Ongoing</h3>
            <p className="text-2xl font-bold text-blue-600">{statistics.byStatus.ongoing}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">{statistics.byStatus.completed}</p>
          </div>
        </div>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {groupKeys.map((groupKey) => {
          const groupTasks = getGroupTasks(groupKey);
          const filteredTasks = getFilteredTasks(groupTasks);
          
          return (
            <div key={groupKey} className="bg-gray-50 rounded-lg p-4 border">
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {groupKey}
                </h3>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                  {filteredTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    viewMode={viewMode}
                    onMove={handleTaskMove}
                    onDelete={handleDeleteTask}
                    options={options}
                  />
                ))}
                
                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks in {groupKey}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Task Card Component
interface TaskCardProps {
  task: Task;
  viewMode: 'status' | 'stage';
  onMove: (taskId: string, newValue: string) => void;
  onDelete: (taskId: string) => void;
  options: Array<{ value: string; label: string }>;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, viewMode, onMove, onDelete, options }) => {
  const getPriorityColor = (priority: any) => {
    const priorityValue = typeof priority === 'string' ? priority : priority?.value || 'medium';
    switch (priorityValue.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityDisplay = (priority: any) => {
    return typeof priority === 'string' ? priority : priority?.value || 'medium';
  };


  const currentValue = viewMode === 'status'
    ? (typeof task.status === 'string' ? task.status : task.status?.value || 'pending')
    : (typeof task.stage === 'string' ? task.stage : task.stage?.value || 'design');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Task Header */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 mr-2">
          {task.title}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {getPriorityDisplay(task.priority)}
        </span>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {task.progress && task.progress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Project */}
      {task.project && (
        <p className="text-xs text-gray-500 mb-3">
          Project: {typeof task.project === 'string' ? task.project : task.project?.value || 'Unknown'}
        </p>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <select
          value={currentValue}
          onChange={(e) => onMove(task.id.toString(), e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => onDelete(task.id.toString())}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskBoard;
