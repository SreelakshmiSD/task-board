'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SideMenu from '@/components/SideMenu'

interface Task {
  id: number
  title: string
  description: string
  project: {
    id: number
    value: string
  }
  stage: {
    id: number
    value: string
  }
  status: {
    id: number
    value: string
  }
  priority: {
    id: number
    value: string
  }
  task_type: {
    id: number
    value: string
  }
}

interface ApiResponse {
  result: string
  records: Task[]
  message?: string
}

export default function TaskListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<'project' | 'task'>('task')

  // Side menu handlers
  const handleMenuItemSelect = (item: 'project' | 'task') => {
    setSelectedMenuItem(item)

    // Navigate to appropriate page
    if (item === 'project') {
      router.push('/projects')
    } else if (item === 'task') {
      router.push('/board')
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  const fetchTasks = async () => {
    if (!session?.user?.email) {
      setError('No user email available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tasks-list?email=${encodeURIComponent(session.user.email)}`)
      const data: ApiResponse = await response.json()

      if (data.result === 'success') {
        setTasks(data.records)
      } else {
        setError(data.message || 'Failed to fetch tasks')
      }
    } catch (err) {
      setError('Error fetching tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group tasks by status
  const groupedTasks = {
    pending: tasks.filter(task => task.status.value.toLowerCase().includes('pending')),
    ongoing: tasks.filter(task => task.status.value.toLowerCase().includes('ongoing') || task.status.value.toLowerCase().includes('on-going')),
    completed: tasks.filter(task => task.status.value.toLowerCase().includes('completed') || task.status.value.toLowerCase().includes('complete'))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Side Menu */}
      <SideMenu
        onMenuItemSelect={handleMenuItemSelect}
        selectedMenuItem={selectedMenuItem}
      />

      <div className="ml-16 flex-1 overflow-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task List</h1>
          <p className="mt-2 text-gray-600">Manage your tasks efficiently</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={fetchTasks}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Tasks'}
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Total Tasks: {tasks.length}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Task Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending ({groupedTasks.pending.length})
            </h2>
            <div className="space-y-3">
              {groupedTasks.pending.map(task => (
                <div key={task.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.project.value}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {task.stage.value.trim()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {task.priority.value}
                    </span>
                  </div>
                </div>
              ))}
              {groupedTasks.pending.length === 0 && (
                <p className="text-gray-500 text-sm">No pending tasks</p>
              )}
            </div>
          </div>

          {/* Ongoing Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ongoing ({groupedTasks.ongoing.length})
            </h2>
            <div className="space-y-3">
              {groupedTasks.ongoing.map(task => (
                <div key={task.id} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.project.value}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {task.stage.value.trim()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {task.priority.value}
                    </span>
                  </div>
                </div>
              ))}
              {groupedTasks.ongoing.length === 0 && (
                <p className="text-gray-500 text-sm">No ongoing tasks</p>
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Completed ({groupedTasks.completed.length})
            </h2>
            <div className="space-y-3">
              {groupedTasks.completed.map(task => (
                <div key={task.id} className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.project.value}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {task.stage.value.trim()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {task.priority.value}
                    </span>
                  </div>
                </div>
              ))}
              {groupedTasks.completed.length === 0 && (
                <p className="text-gray-500 text-sm">No completed tasks</p>
              )}
            </div>
          </div>
        </div>

        {/* Task Details */}
        {tasks.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.slice(0, 10).map(task => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.description.replace(/<[^>]*>/g, '').substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.project.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.stage.value.trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {task.status.value}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.priority.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
