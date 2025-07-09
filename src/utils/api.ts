import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'ongoing' | 'completed'
  stage: 'design' | 'html' | 'development' | 'qa'
  priority: 'low' | 'medium' | 'high'
  assigned_to: number[]
  project: string
  tags: string[]
  progress: number
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: number
  name: string
  email: string
  avatar?: string
  initials: string
  color: string
}

export interface Project {
  id: number
  name: string
  description: string
  color: string
}

// API Functions
export const taskAPI = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks/')
      return response.data
    } catch (error) {
      // Return mock data if API is not available
      return mockData.tasks
    }
  },

  // Get task by ID
  getTask: async (id: number): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${id}/`)
      return response.data
    } catch (error) {
      const task = mockData.tasks.find(t => t.id === id)
      if (!task) throw new Error('Task not found')
      return task
    }
  },

  // Create new task
  createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    try {
      const response = await api.post('/tasks/', task)
      return response.data
    } catch (error) {
      // For demo purposes, just return the task with a mock ID
      const newTask: Task = {
        ...task,
        id: Math.max(...mockData.tasks.map(t => t.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockData.tasks.push(newTask)
      return newTask
    }
  },

  // Update task
  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    try {
      const response = await api.patch(`/tasks/${id}/`, task)
      return response.data
    } catch (error) {
      // Update mock data
      const taskIndex = mockData.tasks.findIndex(t => t.id === id)
      if (taskIndex === -1) throw new Error('Task not found')

      const updatedTask = { ...mockData.tasks[taskIndex], ...task, updated_at: new Date().toISOString() }
      mockData.tasks[taskIndex] = updatedTask
      return updatedTask
    }
  },

  // Delete task
  deleteTask: async (id: number): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}/`)
    } catch (error) {
      // Remove from mock data
      const taskIndex = mockData.tasks.findIndex(t => t.id === id)
      if (taskIndex !== -1) {
        mockData.tasks.splice(taskIndex, 1)
      }
    }
  },

  // Update task status/stage (for drag and drop)
  updateTaskStatus: async (id: number, status: Task['status']): Promise<Task> => {
    try {
      const response = await api.patch(`/tasks/${id}/`, { status })
      return response.data
    } catch (error) {
      // Update mock data
      const taskIndex = mockData.tasks.findIndex(t => t.id === id)
      if (taskIndex === -1) throw new Error('Task not found')

      const updatedTask = { ...mockData.tasks[taskIndex], status, updated_at: new Date().toISOString() }
      mockData.tasks[taskIndex] = updatedTask
      return updatedTask
    }
  },

  updateTaskStage: async (id: number, stage: Task['stage']): Promise<Task> => {
    try {
      const response = await api.patch(`/tasks/${id}/`, { stage })
      return response.data
    } catch (error) {
      // Update mock data
      const taskIndex = mockData.tasks.findIndex(t => t.id === id)
      if (taskIndex === -1) throw new Error('Task not found')

      const updatedTask = { ...mockData.tasks[taskIndex], stage, updated_at: new Date().toISOString() }
      mockData.tasks[taskIndex] = updatedTask
      return updatedTask
    }
  },
}

export const employeeAPI = {
  // Get all employees
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await api.get('/employees/')
      return response.data
    } catch (error) {
      // Return mock data if API is not available
      return mockData.employees
    }
  },

  // Get employee by ID
  getEmployee: async (id: number): Promise<Employee> => {
    try {
      const response = await api.get(`/employees/${id}/`)
      return response.data
    } catch (error) {
      const employee = mockData.employees.find(e => e.id === id)
      if (!employee) throw new Error('Employee not found')
      return employee
    }
  },
}

export const authAPI = {
  // Send OTP
  sendOTP: async (email: string): Promise<void> => {
    await api.post('/auth/email/', { email })
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string): Promise<{ token: string }> => {
    const response = await api.post('/auth/verify/', { email, otp })
    return response.data
  },
}

// Mock data for development (when Django backend is not available)
export const mockData = {
  tasks: [
    {
      id: 1,
      title: 'Mobile App Redesign',
      description: 'Updating UI components and improving user flow',
      status: 'ongoing' as const,
      stage: 'design' as const,
      priority: 'high' as const,
      assigned_to: [1, 2],
      project: 'Mobile App',
      tags: ['Product', 'Design'],
      progress: 75,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'User Testing',
      description: 'Conduct usability tests with target users',
      status: 'pending' as const,
      stage: 'design' as const,
      priority: 'medium' as const,
      assigned_to: [3],
      project: 'Mobile App',
      tags: ['Product', 'Research'],
      progress: 30,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      title: 'Design System Updates',
      description: 'Refresh component library with new styles',
      status: 'ongoing' as const,
      stage: 'design' as const,
      priority: 'low' as const,
      assigned_to: [1, 4],
      project: 'Design System',
      tags: ['Design'],
      progress: 50,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 4,
      title: 'Homepage HTML Structure',
      description: 'Create semantic HTML structure for the homepage',
      status: 'ongoing' as const,
      stage: 'html' as const,
      priority: 'high' as const,
      assigned_to: [2],
      project: 'Website',
      tags: ['Frontend', 'HTML'],
      progress: 60,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 5,
      title: 'Contact Form Implementation',
      description: 'Build responsive contact form with validation',
      status: 'pending' as const,
      stage: 'html' as const,
      priority: 'medium' as const,
      assigned_to: [3],
      project: 'Website',
      tags: ['Frontend', 'Forms'],
      progress: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 6,
      title: 'API Integration',
      description: 'Connect frontend with backend API endpoints',
      status: 'ongoing' as const,
      stage: 'development' as const,
      priority: 'high' as const,
      assigned_to: [1, 4],
      project: 'Mobile App',
      tags: ['Backend', 'API'],
      progress: 40,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 7,
      title: 'Database Schema',
      description: 'Design and implement database structure',
      status: 'completed' as const,
      stage: 'development' as const,
      priority: 'high' as const,
      assigned_to: [4],
      project: 'Mobile App',
      tags: ['Backend', 'Database'],
      progress: 100,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 8,
      title: 'Unit Testing',
      description: 'Write comprehensive unit tests for core functionality',
      status: 'ongoing' as const,
      stage: 'qa' as const,
      priority: 'medium' as const,
      assigned_to: [3, 4],
      project: 'Mobile App',
      tags: ['Testing', 'QA'],
      progress: 65,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 9,
      title: 'Performance Testing',
      description: 'Test application performance under load',
      status: 'pending' as const,
      stage: 'qa' as const,
      priority: 'low' as const,
      assigned_to: [3],
      project: 'Website',
      tags: ['Testing', 'Performance'],
      progress: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 10,
      title: 'Security Audit',
      description: 'Comprehensive security review and testing',
      status: 'completed' as const,
      stage: 'qa' as const,
      priority: 'high' as const,
      assigned_to: [1, 4],
      project: 'Mobile App',
      tags: ['Security', 'QA'],
      progress: 80,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ] as Task[],

  employees: [
    {
      id: 1,
      name: 'Lisa Wong',
      email: 'lisa@company.com',
      initials: 'LW',
      color: '#10b981',
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john@company.com',
      initials: 'JD',
      color: '#4f46e5',
    },
    {
      id: 3,
      name: 'Anna Smith',
      email: 'anna@company.com',
      initials: 'AS',
      color: '#ec4899',
    },
    {
      id: 4,
      name: 'James Taylor',
      email: 'james@company.com',
      initials: 'JT',
      color: '#6366f1',
    },
  ] as Employee[],
}

export default api
