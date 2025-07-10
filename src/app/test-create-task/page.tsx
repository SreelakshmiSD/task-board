'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import CreateTaskModal from '@/components/CreateTaskModal';

export default function TestCreateTaskPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Task Creation</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Session Info</h2>
          <p className="text-gray-600">
            User Email: {session?.user?.email || 'Not logged in'}
          </p>
          <p className="text-gray-600">
            Status: {session ? 'Authenticated' : 'Not authenticated'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Task Creation Test</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to test the task creation functionality.
          </p>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Create New Task
          </button>
        </div>

        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
