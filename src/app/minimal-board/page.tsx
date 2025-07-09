'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useTaskManagement } from '@/lib/hooks/useTaskManagement';

export default function MinimalBoardPage() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  const {
    tasks,
    loading,
    error,
    groupedByStatus,
    groupedByStage,
  } = useTaskManagement({
    autoFetch: true,
    email: userEmail
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Please sign in to view tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Minimal Board Test</h1>
        
        <div className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
          <p>Session Status: {status}</p>
          <p>User Email: {userEmail}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
          <p>Total Tasks: {tasks.length}</p>
        </div>

        <div className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Grouped Counts</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">By Status:</h3>
              <p>Pending: {groupedByStatus.pending.length}</p>
              <p>Ongoing: {groupedByStatus.ongoing.length}</p>
              <p>Completed: {groupedByStatus.completed.length}</p>
            </div>
            <div>
              <h3 className="font-medium">By Stage:</h3>
              <p>Design: {groupedByStage.design.length}</p>
              <p>HTML: {groupedByStage.html.length}</p>
              <p>Development: {groupedByStage.development.length}</p>
              <p>QA: {groupedByStage.qa.length}</p>
            </div>
          </div>
        </div>

        {/* Simple Board Layout */}
        <div className="grid grid-cols-4 gap-6">
          {/* Design Column */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4 text-pink-600">
              Design ({groupedByStage.design.length})
            </h3>
            <div className="space-y-3">
              {groupedByStage.design.map(task => (
                <div key={task.id} className="bg-pink-50 p-3 rounded border">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Status: {typeof task.status === 'object' ? task.status.value : task.status}
                  </p>
                </div>
              ))}
              {groupedByStage.design.length === 0 && (
                <p className="text-gray-500 text-sm">No tasks</p>
              )}
            </div>
          </div>

          {/* HTML Column */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4 text-orange-600">
              HTML ({groupedByStage.html.length})
            </h3>
            <div className="space-y-3">
              {groupedByStage.html.map(task => (
                <div key={task.id} className="bg-orange-50 p-3 rounded border">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Status: {typeof task.status === 'object' ? task.status.value : task.status}
                  </p>
                </div>
              ))}
              {groupedByStage.html.length === 0 && (
                <p className="text-gray-500 text-sm">No tasks</p>
              )}
            </div>
          </div>

          {/* Development Column */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4 text-purple-600">
              Development ({groupedByStage.development.length})
            </h3>
            <div className="space-y-3">
              {groupedByStage.development.map(task => (
                <div key={task.id} className="bg-purple-50 p-3 rounded border">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Status: {typeof task.status === 'object' ? task.status.value : task.status}
                  </p>
                </div>
              ))}
              {groupedByStage.development.length === 0 && (
                <p className="text-gray-500 text-sm">No tasks</p>
              )}
            </div>
          </div>

          {/* QA Column */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4 text-blue-600">
              QA ({groupedByStage.qa.length})
            </h3>
            <div className="space-y-3">
              {groupedByStage.qa.map(task => (
                <div key={task.id} className="bg-blue-50 p-3 rounded border">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Status: {typeof task.status === 'object' ? task.status.value : task.status}
                  </p>
                </div>
              ))}
              {groupedByStage.qa.length === 0 && (
                <p className="text-gray-500 text-sm">No tasks</p>
              )}
            </div>
          </div>
        </div>

        {/* Raw Tasks List */}
        {tasks.length > 0 && (
          <div className="mt-8 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Raw Tasks (First 5)</h2>
            <div className="space-y-2">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="border p-2 rounded text-sm">
                  <p><strong>Title:</strong> {task.title}</p>
                  <p><strong>Status:</strong> {JSON.stringify(task.status)}</p>
                  <p><strong>Stage:</strong> {JSON.stringify(task.stage)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
