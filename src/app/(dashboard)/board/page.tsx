'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  rectIntersection,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Employee, taskAPI, employeeAPI, mockData } from '@/utils/api'
import { useTaskManagement } from '@/lib/hooks/useTaskManagement'
import { Task } from '@/lib/services/taskManagementServices'
import { authUtils } from '@/lib/utils/api-config'
import TaskColumn from '@/components/TaskColumn'
import Filters from '@/components/Filters'
import AvatarGroup from '@/components/AvatarGroup'
import AssigneeList from '@/components/AssigneeList'
import TaskOverview from '@/components/TaskOverview'
import DateRangePicker from '@/components/DateRangePicker'
import SideMenu from '@/components/SideMenu'
import { Calendar, Import, MoreHorizontal, LogOut, User } from 'lucide-react'

export default function BoardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Helper functions to extract string values from API objects
  const getStatusValue = (status: any): string => {
    if (typeof status === 'string') return status
    if (status && typeof status === 'object' && status.value) return status.value
    return 'pending' // default
  }

  const getStageValue = (stage: any): string => {
    if (typeof stage === 'string') return stage
    if (stage && typeof stage === 'object' && stage.value) return stage.value
    return 'design' // default
  }

  // Get user email from session
  const userEmail = session?.user?.email
  // console.log('🔍 BoardPage - Session status:', status, 'userEmail:', userEmail);
  // console.log('🔍 BoardPage - Session object:', session);

  // Simple API integration without hooks to prevent infinite loops
  const [apiTasks, setApiTasks] = useState<Task[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])


  // Task overview state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskOverviewOpen, setIsTaskOverviewOpen] = useState(false)

  // Task overview handlers
  const handleTaskClick = (task: any) => {
    // Convert the task to our Task type if needed
    const convertedTask: Task = {
      ...task,
      assigned_to: task.assigned_to?.map((id: any) => String(id)) || []
    }
    setSelectedTask(convertedTask)
    setIsTaskOverviewOpen(true)
  }

  const handleCloseTaskOverview = () => {
    setIsTaskOverviewOpen(false)
    setSelectedTask(null)
  }

  // Side menu handlers
  const handleMenuItemSelect = (item: 'project' | 'task') => {
    setSelectedMenuItem(item)
    console.log('🔍 Selected menu item:', item)

    // Navigate to appropriate page
    if (item === 'project') {
      router.push('/projects')
    } else if (item === 'task') {
      router.push('/board')
    }
  }

  // Helper function to format date range for API
  const formatDateRange = (startDate: Date | null, endDate: Date | null): string | undefined => {
    if (!startDate || !endDate) return undefined;

    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  };

  // Fetch tasks function
  const fetchTasks = async () => {
    if (!userEmail) {
      setApiError('No user email available')
      return
    }

    // If no projects are available for the selected date range, don't fetch tasks
    if (projects.length === 0) {
      console.log('🚫 No projects available for date range, skipping task fetch')
      setApiTasks([])
      setApiLoading(false)
      return
    }

    setApiLoading(true)
    setApiError(null)

    try {
      // Build URL with date range parameter
      let url = `/api/tasks-list?email=${encodeURIComponent(userEmail)}`;

      const formattedDateRange = formatDateRange(dateRange.startDate, dateRange.endDate);
      if (formattedDateRange) {
        url += `&date_range=${encodeURIComponent(formattedDateRange)}`;
      }

      // Add project filter if a project is selected
      if (selectedProject && selectedProject !== '') {
        // Find the project ID from the selected project name
        const selectedProjectData = projects.find(p => p.name === selectedProject);
        if (selectedProjectData) {
          url += `&project=${encodeURIComponent(selectedProjectData.id)}`;
          console.log('🎯 Adding project filter:', selectedProjectData.id, 'for project:', selectedProject);
        }
      }

      console.log('🔍 Fetching tasks with URL:', url);

      const response = await fetch(url)
      const data = await response.json()

      if (data.result === 'success') {
        setApiTasks(data.records)

      } else {
        setApiError(data.message || 'Failed to fetch tasks')
      }
    } catch (err) {
      setApiError('Error fetching tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setApiLoading(false)
    }
  }

  // Fetch projects function
  const fetchProjects = async () => {
    if (!userEmail) {
      console.log('No user email available for projects')
      return
    }

    try {
      // Build URL with date range parameter
      let url = `/api/project-list?email=${encodeURIComponent(userEmail)}`;

      const formattedDateRange = formatDateRange(dateRange.startDate, dateRange.endDate);
      if (formattedDateRange) {
        url += `&date_range=${encodeURIComponent(formattedDateRange)}`;
      }

      console.log('🔄 Fetching projects for email:', userEmail, 'with URL:', url)
      const response = await fetch(url)
      const data = await response.json()

      console.log('📥 Projects API response:', data)

      if (data.result === 'success' && Array.isArray(data.records)) {
        // Transform API projects to match the expected format
        const transformedProjects = data.records.map((project: any) => ({
          id: project.id,
          name: project.title, // API uses 'title', component expects 'name'
          description: project.description,
          status: project.status?.value || project.status,
          created_at: project.created_at,
          updated_at: project.updated_at || project.created_at
        }))
        console.log('✅ Setting projects:', transformedProjects, 'Count:', transformedProjects.length)
        setProjects(transformedProjects)

        // Auto-select first project if none is currently selected
        if (transformedProjects.length > 0 && (!selectedProject || selectedProject === '' || selectedProject === 'all')) {
          const firstProject = transformedProjects[0].name;
          console.log('🎯 Auto-selecting first project immediately after fetch:', firstProject);
          // Use setTimeout to ensure state update happens after render
          setTimeout(() => {
            setSelectedProject(firstProject);
          }, 0);
        } else if (transformedProjects.length === 0) {
          // Clear selected project if no projects available for this date range
          console.log('🚫 No projects found for date range, clearing selection')
          setSelectedProject('')
        }
      } else {
        console.log('❌ Projects API error:', data.message || 'No records found')
        setProjects([])
        // Clear selected project if no projects available
        setSelectedProject('')
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
      setProjects([])
    }
  }

  // Update task function
  const updateApiTask = async (taskId: string, updateData: any) => {
    try {
      // For now, just update locally (you can implement API update later)
      console.log('Updating task:', taskId, updateData)
      return true
    } catch (err) {
      console.error('Error updating task:', err)
      return false
    }
  }

  // Refetch function
  const refetch = () => {
    fetchTasks()
    fetchProjects()
  }

  // State
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false) // Start with false to reduce initial loading
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState('')

  const [viewMode, setViewMode] = useState<'status' | 'stage'>('stage')
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<'project' | 'task'>('task')

  // Import functionality state
  const [importLoading, setImportLoading] = useState(false)

  // Helper function to get current quarter date range
  const getCurrentQuarterRange = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-based

    // Determine current quarter
    const quarter = Math.floor(currentMonth / 3) + 1

    let startMonth: number
    let endMonth: number

    switch (quarter) {
      case 1: // Q1: Jan-Mar
        startMonth = 0
        endMonth = 2
        break
      case 2: // Q2: Apr-Jun
        startMonth = 3
        endMonth = 5
        break
      case 3: // Q3: Jul-Sep
        startMonth = 6
        endMonth = 8
        break
      case 4: // Q4: Oct-Dec
        startMonth = 9
        endMonth = 11
        break
      default:
        startMonth = 0
        endMonth = 2
    }

    const startDate = new Date(currentYear, startMonth, 1)
    const endDate = new Date(currentYear, endMonth + 1, 0) // Last day of the month

    return { startDate, endDate }
  }

  // Initialize with current quarter
  const [dateRange, setDateRange] = useState<{startDate: Date | null, endDate: Date | null}>(
    getCurrentQuarterRange()
  )

  // Import functionality handlers
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      alert('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)')
      event.target.value = '' // Reset the input
      return
    }

    setImportLoading(true)
    try {
      console.log('Importing file:', file.name, file.type)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('email', userEmail || '')

      // TODO: Replace with actual API call
      // const response = await fetch('/api/import-tasks', {
      //   method: 'POST',
      //   body: formData
      // })

      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Refresh tasks after import
      fetchTasks()

      console.log('Import completed successfully')
      alert('Tasks imported successfully!')
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please try again.')
    } finally {
      setImportLoading(false)
      event.target.value = '' // Reset the input for next use
    }
  }

  // Use API tasks directly since we're now using the correct Task type
  const tasks: Task[] = apiTasks

  // console.log('🔍 BoardPage - API Tasks count:', apiTasks.length);
  // console.log('🔍 BoardPage - API Loading:', apiLoading);
  // console.log('🔍 BoardPage - API Error:', apiError);
  // console.log('🔍 BoardPage - View Mode:', viewMode);

  // if (apiTasks.length > 0) {
  //   console.log('🔍 BoardPage - First task:', apiTasks[0]);
  // }

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  // Load employees data (tasks are loaded via the hook)
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true)
        const employeesData = await employeeAPI.getEmployees()
        setEmployees(employeesData)
      } catch (error) {
        console.error('Error loading employees:', error)
        setEmployees([])
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadEmployees()
      // Auto-fetch tasks and projects when authenticated
      if (userEmail && !apiLoading) {
        if (apiTasks.length === 0) {
          fetchTasks();
        }
        // Fetch projects
        fetchProjects();
      }
      // Email-based authentication - no need to set userId
    }
  }, [status, userEmail])

  // Refetch data when date range changes
  useEffect(() => {
    if (status === 'authenticated' && userEmail) {
      console.log('🔄 Date range changed, refetching data:', dateRange);
      // Reset selected project when date range changes to trigger auto-selection
      setSelectedProject('');
      fetchTasks();
      fetchProjects();
    }
  }, [dateRange])

  // Auto-select first project when projects are loaded
  useEffect(() => {
    console.log('🔍 Projects changed effect:', {
      projectsCount: projects.length,
      currentSelectedProject: selectedProject,
      projectNames: projects.map(p => p.name),
      shouldAutoSelect: projects.length > 0 && (!selectedProject || selectedProject === '' || selectedProject === 'all')
    });

    if (projects.length > 0) {
      // Check if current selected project exists in the new projects list
      const currentProjectExists = projects.some(p => p.name === selectedProject);

      if (!selectedProject || selectedProject === '' || selectedProject === 'all' || !currentProjectExists) {
        const firstProject = projects[0].name;
        console.log('🎯 Auto-selecting first project in useEffect:', firstProject, 'Reason:', {
          noSelection: !selectedProject || selectedProject === '' || selectedProject === 'all',
          projectNotFound: !currentProjectExists
        });
        setSelectedProject(firstProject);
      }
    }
  }, [projects]); // Remove selectedProject from dependencies to avoid infinite loops

  // Refetch tasks when selected project changes
  useEffect(() => {
    if (status === 'authenticated' && userEmail && selectedProject) {
      console.log('🔄 Selected project changed, refetching tasks for project:', selectedProject);
      fetchTasks();
    }
  }, [selectedProject])





  // Group tasks by status or stage using API data
  const groupedTasks = useMemo(() => {
    console.log('🔍 BoardPage - Grouping tasks. Total API tasks:', apiTasks.length);

    // Debug specific task
    const testTask = apiTasks.find(task => task.id === 5670);
    if (testTask) {
      console.log('🎯 Found test task 5670:', {
        title: testTask.title,
        stage: testTask.stage,
        status: testTask.status,
        stageValue: ((testTask.stage as any)?.value || testTask.stage)?.toLowerCase().trim(),
        statusValue: ((testTask.status as any)?.value || testTask.status)?.toLowerCase().trim()
      });
    }

    // Apply filters to tasks
    const filterTasks = (taskList: Task[]) => {
      return taskList.filter((task) => {
        // Search filter
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          const title = task.title?.toLowerCase() || ''
          const description = task.description?.toLowerCase() || ''
          if (!title.includes(query) && !description.includes(query)) {
            return false
          }
        }

        // Project filter - only filter if a specific project is selected
        if (selectedProject && selectedProject !== 'all' && selectedProject !== '') {
          const taskProjectName = typeof task.project === 'string' ? task.project : task.project?.value;
          if (taskProjectName !== selectedProject) {
            return false;
          }
        }



        // Date range filter is now handled at API level, so we don't need frontend filtering
        // The API already returns tasks filtered by the selected date range

        return true
      })
    }

    // Apply filters first
    const filteredApiTasks = filterTasks(apiTasks);

    if (viewMode === 'status') {
      const statusGrouped = {
        pending: filteredApiTasks.filter(task => {
          const statusValue = typeof task.status === 'string' ? task.status : task.status?.value
          return statusValue?.toLowerCase().includes('pending')
        }),
        ongoing: filteredApiTasks.filter(task => {
          const statusValue = typeof task.status === 'string' ? task.status : task.status?.value
          return statusValue?.toLowerCase().includes('ongoing') || statusValue?.toLowerCase().includes('on-going')
        }),
        completed: filteredApiTasks.filter(task => {
          const statusValue = typeof task.status === 'string' ? task.status : task.status?.value
          return statusValue?.toLowerCase().includes('completed') || statusValue?.toLowerCase().includes('complete')
        })
      }
      return {
        pending: statusGrouped.pending,
        ongoing: statusGrouped.ongoing,
        completed: statusGrouped.completed
      }
    } else {
      const stageGrouped = {
        design: filteredApiTasks.filter(task => {
          const stageValue = typeof task.stage === 'string' ? task.stage : task.stage?.value
          return stageValue?.toLowerCase().includes('design')
        }),
        html: filteredApiTasks.filter(task => {
          const stageValue = ((task.stage as any)?.value || task.stage)?.toLowerCase().trim()
          return stageValue?.includes('html')
        }),
        development: filteredApiTasks.filter(task => {
          const stageValue = ((task.stage as any)?.value || task.stage)?.toLowerCase().trim()
          return stageValue?.includes('development')
        }),
        qa: filteredApiTasks.filter(task => {
          const stageValue = ((task.stage as any)?.value || task.stage)?.toLowerCase().trim()
          return stageValue?.includes('qa')
        })
      }

      console.log('🔍 Stage grouped results:', {
        design: stageGrouped.design.length,
        html: stageGrouped.html.length,
        development: stageGrouped.development.length,
        qa: stageGrouped.qa.length
      });

      // Debug QA tasks specifically
      console.log('🔍 QA tasks:', stageGrouped.qa.map(task => ({
        id: task.id,
        title: task.title,
        stage: task.stage,
        stageValue: ((task.stage as any)?.value || task.stage)?.toLowerCase().trim()
      })));

      return {
        design: stageGrouped.design,
        html: stageGrouped.html,
        development: stageGrouped.development,
        qa: stageGrouped.qa
      }
    }
  }, [apiTasks, viewMode, searchQuery, selectedProject, dateRange])

  // Column configurations
  const statusColumns = [
    { id: 'pending', title: 'Pending' },
    { id: 'ongoing', title: 'On-going' },
    { id: 'completed', title: 'Completed' },
  ]

  const stageColumns = [
    { id: 'design', title: 'Design' },
    { id: 'html', title: 'HTML' },
    { id: 'development', title: 'Development' },
    { id: 'qa', title: 'QA' },
  ]

  const columns = viewMode === 'status' ? statusColumns : stageColumns

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setDraggedTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedTask(null)

    if (!over) return

    const taskId = active.id as number
    const task = tasks.find(t => t.id === taskId)

    if (!task) return

    // Determine the target column
    let newColumn: string

    // Check if we're dropping on a column or on a task
    const overId = over.id as string | number

    // If overId is a number, it's a task ID - find which column that task belongs to
    if (typeof overId === 'number') {
      const targetTask = tasks.find(t => t.id === overId)
      if (targetTask) {
        newColumn = viewMode === 'status'
          ? getStatusValue(targetTask.status)
          : getStageValue(targetTask.stage)
      } else {
        return // Invalid drop target
      }
    } else {
      // It's a column ID
      newColumn = overId
    }

    // Check if task is already in the target column
    const currentValue = viewMode === 'status'
      ? getStatusValue(task.status)
      : getStageValue(task.stage)
    if (currentValue === newColumn) return

    // Validate that the new column is valid
    const validColumns = viewMode === 'status'
      ? ['pending', 'ongoing', 'completed']
      : ['design', 'html', 'development', 'qa']

    if (!validColumns.includes(newColumn)) {
      return
    }

    // Update task using our API integration
    try {
      const updateData = { [viewMode]: newColumn }
      const success = await updateApiTask(taskId.toString(), updateData)

      if (!success) {
        console.error('Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  console.log('🔍 BoardPage - Render check:', {
    sessionStatus: status,
    loading: loading,
    apiLoading: apiLoading,
    shouldShowLoading: status === 'loading'
  });

  // Only show full-screen loading for session loading
  // Removed employee loading to reduce blinking when switching pages
  if (status === 'loading') {
    console.log('🔍 BoardPage - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  // Show API status if there's an issue (but continue with demo data)
  // const showApiWarning = apiError && !apiError.includes('demo data')

  // console.log('🔍 BoardPage - Rendering board with columns:', columns.length);
  // console.log('🔍 BoardPage - Final grouped tasks:', Object.keys(groupedTasks).map(key => `${key}: ${(groupedTasks as any)[key]?.length || 0}`));

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Side Menu */}
      <SideMenu
        onMenuItemSelect={handleMenuItemSelect}
        selectedMenuItem={selectedMenuItem}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b overflow-visible">
        <div className="px-6 py-4 ml-16 transition-all duration-300 overflow-visible">
          <div className="flex items-center justify-between overflow-visible">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Company Overview</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4 overflow-visible">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select date range"
                className="hidden md:block"
              />
              
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={importLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="import-file-input"
                />
                <label
                  htmlFor="import-file-input"
                  className={`flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    importLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {importLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Import className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline">
                    {importLoading ? 'Importing...' : 'Import'}
                  </span>
                </label>
              </div>

              <AssigneeList maxVisible={3} size="md" email={userEmail || undefined} />

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700 hidden md:inline">
                    {session?.user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{session?.user?.name || 'User'}</div>
                      <div className="text-xs text-gray-500">{session?.user?.email}</div>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/signin' })}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* API Status Banner */}
      {apiError && apiError.includes('demo data') && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> API not available - showing sample data.
                <button
                  onClick={() => refetch()}
                  className="ml-2 underline hover:no-underline"
                >
                  Try reconnecting
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="ml-16 transition-all duration-300">
        <Filters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          projects={projects}
          projectsLoaded={true} // Always true since we're using API data
        />
      </div>

      {/* Board */}
      <div className="flex-1 p-6 overflow-hidden ml-16 transition-all duration-300">
        <div className="relative h-full">
          {/* Subtle loading overlay for API calls */}
          {apiLoading && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-75 flex items-center justify-center py-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="text-sm">Loading tasks...</span>
              </div>
            </div>
          )}

          {/* Show empty state only if we've tried to load projects and found none */}
          {!apiLoading && projects.length === 0 && apiTasks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-500 mb-4">
                  No projects are available for the selected date range.
                </p>
                <p className="text-sm text-gray-400">
                  Try selecting a different date range to see projects and tasks.
                </p>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex space-x-6 overflow-x-auto h-full pb-6">
                {columns.map((column) => (
                  <TaskColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    tasks={(groupedTasks as any)[column.id] || []}
                    employees={employees}
                    onTaskClick={handleTaskClick}
                    onAddTask={() => console.log('Add task to:', column.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </DndContext>
          )}
        </div>
      </div>

      {/* Task Overview Panel */}
      <TaskOverview
        task={selectedTask}
        isOpen={isTaskOverviewOpen}
        onClose={handleCloseTaskOverview}
      />


    </div>
  )
}
