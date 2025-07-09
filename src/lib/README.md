# Task Management Library

This library provides a complete task management solution following a service-based architecture pattern similar to your existing codebase structure.

## 📁 Folder Structure

```
src/lib/
├── services/
│   └── taskManagementServices.ts    # Core API service layer
├── hooks/
│   └── useTaskManagement.ts         # React hook for state management
├── utils/
│   └── api-config.ts                # Axios configuration and utilities
├── components/
│   └── TaskBoard.tsx                # Reusable task board component
├── index.ts                         # Main exports
└── README.md                        # This file
```

## 🚀 Quick Start

### 1. Import and Use the Hook

```tsx
import { useTaskManagement } from '@/lib/hooks/useTaskManagement'

export default function YourComponent() {
  const {
    tasks,
    projects,
    loading,
    error,
    groupedByStatus,
    groupedByStage,
    statistics,
    refetch
  } = useTaskManagement({ autoFetch: true, userId: 'your-user-id' })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {/* Your task display logic */}
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
}
```

### 2. Use the TaskBoard Component

```tsx
import { TaskBoard } from '@/lib/components/TaskBoard'

export default function TasksPage() {
  return (
    <div>
      <h1>My Tasks</h1>
      <TaskBoard 
        userId="your-user-id" 
        viewMode="status" 
        showProjects={true} 
      />
    </div>
  )
}
```

### 3. Direct Service Usage

```tsx
import { taskManagementServices } from '@/lib/services/taskManagementServices'

// Fetch tasks
const response = await taskManagementServices.getTasksList('user-id')
if (response.status === 'success') {
  const tasks = response.records
  // Use tasks...
}

// Group tasks
const groupedByStatus = taskManagementServices.groupTasksByStatus(tasks)
const groupedByStage = taskManagementServices.groupTasksByStage(tasks)
```

## 📊 API Endpoints

The service connects to these endpoints:

- **POST** `/tasks-list/` - Get all tasks for a user
- **POST** `/project-list/` - Get all projects for a user  
- **POST** `/tasks/` - Create a new task
- **PUT** `/tasks/{id}/` - Update a task
- **DELETE** `/tasks/{id}/` - Delete a task

## 🔧 Configuration

### Set User ID

```tsx
import { authUtils } from '@/lib/utils/api-config'

// Set user ID (persisted in localStorage)
authUtils.setUserId('your-user-id')

// Get current user ID
const userId = authUtils.getUserId()
```

### Authentication Token

```tsx
import { authUtils } from '@/lib/utils/api-config'

// Set auth token (if required)
authUtils.setToken('your-auth-token')

// Remove token
authUtils.removeToken()
```

## 📋 Data Structures

### Task Interface

```tsx
interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'ongoing' | 'completed'
  stage: 'design' | 'html' | 'development' | 'qa'
  priority: 'low' | 'medium' | 'high'
  assigned_to: string[]
  project: string
  tags: string[]
  progress: number
  created_at: string
  updated_at: string
  due_date?: string
}
```

### Project Interface

```tsx
interface Project {
  id: number
  name: string
  description: string
  status: string
  created_at: string
  updated_at: string
}
```

## 🎯 Hook API Reference

### `useTaskManagement(options)`

#### Options
```tsx
interface UseTaskManagementOptions {
  autoFetch?: boolean    // Auto-fetch on mount (default: false)
  userId?: string        // User ID for API requests
}
```

#### Returns
```tsx
{
  // Data
  tasks: Task[]
  projects: Project[]
  
  // Loading states
  loading: boolean
  tasksLoading: boolean
  projectsLoading: boolean
  
  // Error states
  error: string | null
  tasksError: string | null
  projectsError: string | null
  
  // Grouped data
  groupedByStatus: {
    pending: Task[]
    ongoing: Task[]
    completed: Task[]
  }
  groupedByStage: {
    design: Task[]
    html: Task[]
    development: Task[]
    qa: Task[]
  }
  
  // Statistics
  statistics: {
    total: number
    byStatus: Record<string, number>
    byStage: Record<string, number>
    byPriority: Record<string, number>
    completionRate: number
  }
  
  // Actions
  refetch: () => Promise<void>
  refetchTasks: () => Promise<void>
  refetchProjects: () => Promise<void>
  
  // Task operations
  createTask: (taskData) => Promise<boolean>
  updateTask: (taskId, updates) => Promise<boolean>
  deleteTask: (taskId) => Promise<boolean>
  
  // Utility functions
  filterByProject: (projectName: string) => Task[]
  searchTasks: (query: string) => Task[]
}
```

## 🛠️ Service Methods

### Task Management Services

```tsx
// Data fetching
taskManagementServices.getTasksList(userId)
taskManagementServices.getProjectsList(userId)

// CRUD operations
taskManagementServices.createTask(taskData)
taskManagementServices.updateTask(taskId, updates)
taskManagementServices.deleteTask(taskId)

// Data grouping
taskManagementServices.groupTasksByStatus(tasks)
taskManagementServices.groupTasksByStage(tasks)
taskManagementServices.filterTasksByProject(tasks, projectName)

// Statistics
taskManagementServices.getTaskStatistics(tasks)
```

## 🧪 Testing

Visit `/lib-demo` to see the complete integration in action with:

- Live API connection testing
- Task grouping by status and stage
- Project filtering
- Search functionality
- Raw data inspection
- Error handling demonstration

## 🔄 Integration with Existing Code

To integrate with your existing Trello-like UI:

1. **Replace data fetching logic:**
   ```tsx
   // Instead of:
   const [tasks, setTasks] = useState(dummyTasks)
   
   // Use:
   const { tasks, groupedByStatus, loading, error } = useTaskManagement({ autoFetch: true })
   ```

2. **Use grouped data for columns:**
   ```tsx
   // For status-based columns
   const columns = Object.entries(groupedByStatus)
   
   // For stage-based columns  
   const columns = Object.entries(groupedByStage)
   ```

3. **Implement task updates:**
   ```tsx
   const { updateTask } = useTaskManagement()
   
   const handleTaskMove = async (taskId, newStatus) => {
     await updateTask(taskId, { status: newStatus })
   }
   ```

## 🎨 Customization

### Custom API Base URL

Modify `src/lib/utils/api-config.ts`:

```tsx
export const API_CONFIG = {
  BASE_URL: 'your-custom-api-url',
  // ...
}
```

### Extend Task Interface

Add custom fields to the Task interface in `taskManagementServices.ts`:

```tsx
export interface Task {
  // Existing fields...
  customField: string
  anotherField: number
}
```

## 🚨 Error Handling

The library includes comprehensive error handling:

- Network error detection and retry logic
- User-friendly error messages
- Loading state management
- Graceful fallbacks

## 📝 Best Practices

1. **Always handle loading and error states**
2. **Use the `autoFetch` option for automatic data loading**
3. **Set user ID using `authUtils.setUserId()` before using the hook**
4. **Use the grouped data (`groupedByStatus`, `groupedByStage`) for UI rendering**
5. **Implement optimistic updates for better UX**

## 🔗 Related Files

- Test page: `/lib-demo`
- Service architecture demo: See the demo page for live examples
- Integration examples: Check the TaskBoard component for implementation patterns
