'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTaskManagement } from '@/lib/hooks/useTaskManagement';

export default function SimpleTestPage() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  console.log('🔍 SimpleTest - Component render:', { status, userEmail, session: !!session });

  const {
    tasks,
    loading,
    error,
    groupedByStatus,
    groupedByStage,
    refetch
  } = useTaskManagement({
    autoFetch: true, // Always enable autoFetch
    email: userEmail || undefined
  });

  // Manually trigger refetch when email becomes available
  useEffect(() => {
    if (userEmail && tasks.length === 0 && !loading) {
      console.log('🔄 SimpleTest - Manually triggering refetch for email:', userEmail);
      refetch();
    }
  }, [userEmail, tasks.length, loading, refetch]);

  const [testResults, setTestResults] = useState<any>({});

  const handleManualRefetch = () => {
    console.log('🔄 Manual refetch triggered');
    refetch();
  };

  useEffect(() => {
    console.log('🔍 SimpleTest - Tasks updated:', tasks.length);
    console.log('🔍 SimpleTest - Grouped by status:', {
      pending: groupedByStatus.pending.length,
      ongoing: groupedByStatus.ongoing.length,
      completed: groupedByStatus.completed.length
    });
    console.log('🔍 SimpleTest - Grouped by stage:', {
      design: groupedByStage.design.length,
      html: groupedByStage.html.length,
      development: groupedByStage.development.length,
      qa: groupedByStage.qa.length
    });

    if (tasks.length > 0) {
      const firstTask = tasks[0];
      console.log('🔍 SimpleTest - First task:', firstTask);

      // Test the helper functions directly
      const getStatusValue = (status: any): string => {
        console.log('🔍 SimpleTest - getStatusValue input:', status);
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

        console.log('🔍 SimpleTest - getStatusValue output:', value);
        return value;
      };

      const getStageValue = (stage: any): string => {
        console.log('🔍 SimpleTest - getStageValue input:', stage);
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

        console.log('🔍 SimpleTest - getStageValue output:', value);
        return value;
      };

      const statusValue = getStatusValue(firstTask.status);
      const stageValue = getStageValue(firstTask.stage);

      setTestResults({
        firstTask,
        statusValue,
        stageValue,
        statusMatches: {
          pending: statusValue === 'pending',
          ongoing: statusValue === 'ongoing',
          completed: statusValue === 'completed'
        },
        stageMatches: {
          design: stageValue === 'design',
          html: stageValue === 'html',
          development: stageValue === 'development',
          qa: stageValue === 'qa'
        }
      });
    }
  }, [tasks, groupedByStatus, groupedByStage]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple Test</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-bold mb-2">Session Info</h2>
          <p>Status: {status}</p>
          <p>Email: {userEmail || 'Not available'}</p>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-bold mb-2">Hook State</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
          <p>Tasks count: {tasks.length}</p>
          <button
            onClick={handleManualRefetch}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Manual Refetch
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-bold mb-2">Grouped Counts</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">By Status:</h3>
              <p>Pending: {groupedByStatus.pending.length}</p>
              <p>Ongoing: {groupedByStatus.ongoing.length}</p>
              <p>Completed: {groupedByStatus.completed.length}</p>
            </div>
            <div>
              <h3 className="font-semibold">By Stage:</h3>
              <p>Design: {groupedByStage.design.length}</p>
              <p>HTML: {groupedByStage.html.length}</p>
              <p>Development: {groupedByStage.development.length}</p>
              <p>QA: {groupedByStage.qa.length}</p>
            </div>
          </div>
        </div>

        {testResults.firstTask && (
          <div className="bg-purple-50 p-4 rounded">
            <h2 className="font-bold mb-2">First Task Analysis</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Title:</strong> {testResults.firstTask.title}</p>
              <p><strong>Raw Status:</strong> {JSON.stringify(testResults.firstTask.status)}</p>
              <p><strong>Raw Stage:</strong> {JSON.stringify(testResults.firstTask.stage)}</p>
              <p><strong>Processed Status:</strong> {testResults.statusValue}</p>
              <p><strong>Processed Stage:</strong> {testResults.stageValue}</p>
              
              <div className="mt-4">
                <h3 className="font-semibold">Status Matches:</h3>
                <p>Pending: {testResults.statusMatches.pending ? '✅' : '❌'}</p>
                <p>Ongoing: {testResults.statusMatches.ongoing ? '✅' : '❌'}</p>
                <p>Completed: {testResults.statusMatches.completed ? '✅' : '❌'}</p>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold">Stage Matches:</h3>
                <p>Design: {testResults.stageMatches.design ? '✅' : '❌'}</p>
                <p>HTML: {testResults.stageMatches.html ? '✅' : '❌'}</p>
                <p>Development: {testResults.stageMatches.development ? '✅' : '❌'}</p>
                <p>QA: {testResults.stageMatches.qa ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="font-bold mb-2">Sample Tasks</h2>
            <div className="space-y-2">
              {tasks.slice(0, 3).map(task => (
                <div key={task.id} className="bg-white p-2 rounded border">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-600">Status: {JSON.stringify(task.status)}</p>
                  <p className="text-sm text-gray-600">Stage: {JSON.stringify(task.stage)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
