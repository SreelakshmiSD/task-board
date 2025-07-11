'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import AssigneeDropdown from '@/components/AssigneeDropdown';
import { ApiTaskAssignee } from '@/lib/services/taskManagementServices';

export default function AssigneeDropdownDemo() {
  const { data: session } = useSession();
  const [currentAssignees, setCurrentAssignees] = useState<ApiTaskAssignee[]>([
    {
      id: 112,
      name: 'sidharth r',
      email: 'sidharth@nuox.io',
      profile_pic: 'https://workflow-dev.e8demo.com/media/profile/1mb.jpeg'
    }
  ]);

  const handleAssigneesChange = (newAssignees: ApiTaskAssignee[]) => {
    console.log('Assignees changed:', newAssignees);
    setCurrentAssignees(newAssignees);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Assignee Dropdown Demo
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">How it works:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Click on the assignee avatars or user icon to open the dropdown</li>
            <li>Search for team members by name or email</li>
            <li>Click on a member to assign/unassign them</li>
            <li>The dropdown fetches team members based on the selected project</li>
            <li>Changes are automatically saved to the API</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Demo Card 1 - With Project ID */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Task Card with Project Filtering</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Sample Task - HR Portal E8</h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  In Progress
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                This task uses project ID 319 (HR Portal E8) to filter team members.
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Assignees:</span>
                <AssigneeDropdown
                  currentAssignees={currentAssignees}
                  taskId={5781} // Demo task ID
                  projectId={319} // HR Portal E8 project
                  email={session?.user?.email}
                  onAssigneesChange={handleAssigneesChange}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Demo Card 2 - Without Project ID */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Task Card without Project Filtering</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Sample Task - All Projects</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Completed
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                This task shows all team members (no project filtering).
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Assignees:</span>
                <AssigneeDropdown
                  currentAssignees={[]}
                  taskId={5782} // Demo task ID
                  email={session?.user?.email}
                  onAssigneesChange={(assignees) => console.log('All projects assignees:', assignees)}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Current State Display */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Current Assignees State</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(currentAssignees, null, 2)}
          </pre>
        </div>

        {/* API Information */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">API Integration</h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>Team Members API:</strong> /api/team-members-list?email={session?.user?.email}&project_id=319</p>
            <p><strong>Update Assignees API:</strong> /api/update-task-assignees</p>
            <p><strong>Current User:</strong> {session?.user?.email || 'Not logged in'}</p>
          </div>
        </div>

        {/* Size Variations */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Size Variations</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-16 text-sm">Small:</span>
              <AssigneeDropdown
                currentAssignees={currentAssignees.slice(0, 1)}
                projectId={319}
                email={session?.user?.email}
                onAssigneesChange={() => {}}
                size="sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="w-16 text-sm">Medium:</span>
              <AssigneeDropdown
                currentAssignees={currentAssignees}
                projectId={319}
                email={session?.user?.email}
                onAssigneesChange={() => {}}
                size="md"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="w-16 text-sm">Large:</span>
              <AssigneeDropdown
                currentAssignees={currentAssignees}
                projectId={319}
                email={session?.user?.email}
                onAssigneesChange={() => {}}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
