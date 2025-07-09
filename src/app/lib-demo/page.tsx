'use client';

import React, { useState } from 'react';
import { useTaskManagement } from '@/lib/hooks/useTaskManagement';
import { TaskBoard } from '@/lib/components/TaskBoard';
import { authUtils } from '@/lib/utils/api-config';

export default function LibDemoPage() {
  const [userId, setUserId] = useState(authUtils.getUserId());
  const [viewMode, setViewMode] = useState<'status' | 'stage'>('status');
  const [showRawData, setShowRawData] = useState(false);

  const {
    tasks,
    projects,
    loading,
    error,
    statistics,
    groupedByStatus,
    groupedByStage,
    refetch
  } = useTaskManagement({ autoFetch: true, userId });

  const handleUserIdChange = (newUserId: string) => {
    setUserId(newUserId);
    authUtils.setUserId(newUserId);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management - Lib Structure Demo</h1>
              <p className="text-gray-600">Using service-based architecture with lib folder structure</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => handleUserIdChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter user ID"
                />
              </div>

              {/* View Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View Mode
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'status' | 'stage')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="status">By Status</option>
                  <option value="stage">By Stage</option>
                </select>
              </div>

              {/* Controls */}
              <div className="flex space-x-2">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  {showRawData ? 'Hide' : 'Show'} Raw Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Architecture Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-blue-800 font-semibold mb-3">Service Architecture Structure</h2>
          <div className="text-blue-700 space-y-2 text-sm">
            <p><strong>📁 lib/services/taskManagementServices.ts</strong> - API service layer with CRUD operations</p>
            <p><strong>📁 lib/hooks/useTaskManagement.ts</strong> - React hook for state management</p>
            <p><strong>📁 lib/utils/api-config.ts</strong> - Axios configuration and utilities</p>
            <p><strong>📁 lib/components/TaskBoard.tsx</strong> - Reusable task board component</p>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Status & Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                loading ? 'text-yellow-600' : 
                error ? 'text-red-600' : 
                'text-green-600'
              }`}>
                {loading ? 'Loading' : error ? 'Error' : 'Connected'}
              </div>
              <div className="text-sm text-gray-500">Connection Status</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
              <div className="text-sm text-gray-500">Total Tasks</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{projects.length}</div>
              <div className="text-sm text-gray-500">Projects</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.completionRate}%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{userId}</div>
              <div className="text-sm text-gray-500">Current User</div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold">Error Details:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Task Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
            <div className="space-y-3">
              {Object.entries(statistics.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700">{status}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${statistics.total > 0 ? (count / statistics.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Stage</h3>
            <div className="space-y-3">
              {Object.entries(statistics.byStage).map(([stage, count]) => (
                <div key={stage} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700">{stage}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${statistics.total > 0 ? (count / statistics.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Raw Data Display */}
        {showRawData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw API Data</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tasks Data (First 3)</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(tasks.slice(0, 3), null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Projects Data</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(projects, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Task Board */}
        <div className="bg-white rounded-lg shadow p-6">
          <TaskBoard 
            userId={userId} 
            viewMode={viewMode}
            showProjects={true}
          />
        </div>

        {/* Usage Example */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="text-gray-800 font-semibold mb-4">Usage Example</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// Import the hook
import { useTaskManagement } from '@/lib/hooks/useTaskManagement'

// Use in your component
export default function YourComponent() {
  const {
    tasks,
    projects,
    loading,
    error,
    groupedByStatus,
    groupedByStage,
    statistics,
    refetch,
    createTask,
    updateTask,
    deleteTask
  } = useTaskManagement({ autoFetch: true, userId: 'your-user-id' })

  // Your component logic here
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      {/* Display tasks grouped by status */}
      {Object.entries(groupedByStatus).map(([status, tasks]) => (
        <div key={status}>
          <h3>{status} ({tasks.length})</h3>
          {tasks.map(task => (
            <div key={task.id}>{task.title}</div>
          ))}
        </div>
      ))}
    </div>
  )
}`}
          </pre>
        </div>

        {/* Service Methods */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="text-gray-800 font-semibold mb-4">Available Service Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Fetching</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <code>getTasksList(userId)</code></li>
                <li>• <code>getProjectsList(userId)</code></li>
                <li>• <code>refetch()</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Task Operations</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <code>createTask(taskData)</code></li>
                <li>• <code>updateTask(id, updates)</code></li>
                <li>• <code>deleteTask(id)</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Grouping</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <code>groupTasksByStatus(tasks)</code></li>
                <li>• <code>groupTasksByStage(tasks)</code></li>
                <li>• <code>filterTasksByProject(tasks, project)</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Utilities</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <code>getTaskStatistics(tasks)</code></li>
                <li>• <code>searchTasks(query)</code></li>
                <li>• <code>filterByProject(project)</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
