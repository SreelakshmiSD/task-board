'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import AssigneeList from '@/components/AssigneeList'

export default function AssigneeDemoPage() {
  const { data: session } = useSession()
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Assignee List Demo
        </h1>

        {/* Email Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (for API call)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={session?.user?.email || "Enter email address"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                {session?.user?.email ? `Authenticated as: ${session.user.email}` : 'Not authenticated'}
              </p>
            </div>
          </div>
        </div>

        {/* Demo Sections */}
        <div className="space-y-8">
          {/* Small Size */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Small Size (sm)</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Show first 3 members:</p>
                <AssigneeList 
                  size="sm" 
                  maxVisible={3} 
                  email={email || session?.user?.email || undefined}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Show first 5 members:</p>
                <AssigneeList 
                  size="sm" 
                  maxVisible={5} 
                  email={email || session?.user?.email || undefined}
                />
              </div>
            </div>
          </div>

          {/* Medium Size */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Medium Size (md)</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Show first 3 members:</p>
                <AssigneeList 
                  size="md" 
                  maxVisible={3} 
                  email={email || session?.user?.email || undefined}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Show first 4 members:</p>
                <AssigneeList 
                  size="md" 
                  maxVisible={4} 
                  email={email || session?.user?.email || undefined}
                />
              </div>
            </div>
          </div>

          {/* Large Size */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Large Size (lg)</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Show first 3 members:</p>
                <AssigneeList 
                  size="lg" 
                  maxVisible={3} 
                  email={email || session?.user?.email || undefined}
                />
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">In a Card Header</h4>
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Project Task</h5>
                    <AssigneeList 
                      size="sm" 
                      maxVisible={3} 
                      email={email || session?.user?.email || undefined}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">In a List Item</h4>
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="font-medium">Team Meeting</p>
                      <p className="text-sm text-gray-500">Discuss project progress</p>
                    </div>
                    <AssigneeList 
                      size="md" 
                      maxVisible={4} 
                      email={email || session?.user?.email || undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
