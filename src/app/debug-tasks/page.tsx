'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTaskManagement } from '@/lib/hooks/useTaskManagement';

export default function DebugTasksPage() {
  const { data: session } = useSession();
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Tasks</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Info</h2>
        <p>Email: {userEmail || 'Not logged in'}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Raw Tasks ({tasks.length})</h2>
        <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
          <pre className="text-xs">
            {JSON.stringify(tasks.slice(0, 3), null, 2)}
          </pre>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Grouped by Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium">Pending ({groupedByStatus.pending.length})</h3>
            <ul className="text-sm">
              {groupedByStatus.pending.slice(0, 5).map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Ongoing ({groupedByStatus.ongoing.length})</h3>
            <ul className="text-sm">
              {groupedByStatus.ongoing.slice(0, 5).map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Completed ({groupedByStatus.completed.length})</h3>
            <ul className="text-sm">
              {groupedByStatus.completed.slice(0, 5).map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Grouped by Stage</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <h3 className="font-medium">Design ({groupedByStage.design.length})</h3>
            <ul className="text-sm">
              {groupedByStage.design.slice(0, 5).map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">HTML ({groupedByStage.html.length})</h3>
            <ul className="text-sm">
              {groupedByStage.html.slice(0, 5).map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Development ({groupedByStage.development.length})</h3>
            <ul className="text-sm">
              {groupedByStage.development.slice(0, 5).map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">QA ({groupedByStage.qa.length})</h3>
            <ul className="text-sm">
              {groupedByStage.qa.slice(0, 5).map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Sample Task Details</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Title:</strong> {tasks[0].title}</p>
            <p><strong>Status:</strong> {JSON.stringify(tasks[0].status)}</p>
            <p><strong>Stage:</strong> {JSON.stringify(tasks[0].stage)}</p>
            <p><strong>Project:</strong> {JSON.stringify(tasks[0].project)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
