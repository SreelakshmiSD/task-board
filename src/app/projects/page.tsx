'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Clock, FolderOpen, Tag, Timer, Layers, Import, User, LogOut, Search } from 'lucide-react'
import SideMenu from '@/components/SideMenu'
import DateRangePicker from '@/components/DateRangePicker'
import AssigneeList from '@/components/AssigneeList'

interface Project {
  id: number
  title: string
  name: string
  description: string
  status: any
  project_type?: any
  estimated_hours?: number
  duration?: number
  stage?: any
  created_at: string
  updated_at: string
}

interface ApiResponse {
  result: string
  records: Project[]
  message?: string
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<'project' | 'task'>('project')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  // Helper function to format date range for API
  const formatDateRange = (startDate: Date | null, endDate: Date | null): string | undefined => {
    if (!startDate || !endDate) return undefined;

    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    return `${formatDate(startDate)} to ${formatDate(endDate)}`;
  };

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

  const fetchProjects = async () => {
    if (!session?.user?.email) {
      setError('No user email available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Build URL with date range parameter
      let url = `/api/project-list?email=${encodeURIComponent(session.user.email)}`;

      const formattedDateRange = formatDateRange(dateRange.startDate, dateRange.endDate);
      if (formattedDateRange) {
        url += `&date_range=${encodeURIComponent(formattedDateRange)}`;
      }

      console.log('🔄 Fetching projects with URL:', url)
      const response = await fetch(url)
      const data: ApiResponse = await response.json()

      if (data.result === 'success' && Array.isArray(data.records)) {
        // Transform API projects to match the expected format
        const transformedProjects = data.records.map((project: any) => ({
          id: project.id,
          title: project.title,
          name: project.title, // API uses 'title', component expects 'name'
          description: project.description,
          status: project.status?.value || project.status,
          project_type: project.project_type,
          estimated_hours: project.estimated_hours,
          duration: project.duration,
          stage: project.stage,
          created_at: project.created_at,
          updated_at: project.updated_at || project.created_at
        }))
        console.log('✅ Setting projects:', transformedProjects, 'Count:', transformedProjects.length)
        setProjects(transformedProjects)
      } else {
        setError(data.message || 'Failed to fetch projects')
      }
    } catch (err) {
      setError('Error fetching projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch projects when component mounts
  useEffect(() => {
    if (session?.user?.email) {
      fetchProjects()
    }
  }, [session?.user?.email])

  // Refetch projects when date range changes
  useEffect(() => {
    if (session?.user?.email) {
      console.log('🔄 Date range changed, refetching projects:', dateRange);
      fetchProjects();
    }
  }, [dateRange])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProjectTypeValue = (projectType: any): string => {
    if (typeof projectType === 'string') return projectType.trim()
    if (projectType && typeof projectType === 'object' && projectType.value) return projectType.value.trim()
    return ''
  }

  const stripHtmlTags = (html: string): string => {
    if (!html) return ''
    // Remove HTML tags and decode HTML entities
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  }

  const formatDuration = (duration: number): string => {
    if (!duration) return ''
    if (duration === 1) return '1 day'
    return `${duration} days`
  }

  const getStageValue = (stage: any): string => {
    if (typeof stage === 'string') return stage.trim()
    if (stage && typeof stage === 'object' && stage.value) return stage.value.trim()
    return ''
  }

  const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const openDescriptionModal = (project: Project) => {
    setSelectedProject(project)
    setIsDescriptionModalOpen(true)
  }

  const closeDescriptionModal = () => {
    setIsDescriptionModalOpen(false)
    setSelectedProject(null)
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

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 ml-16 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-auto">
              {/* Date Range Picker */}
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select date range"
                className="hidden md:block"
              />

              {/* Search Bar */}
              <div className="max-w-sm">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
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

      <div className="ml-16 flex-1 overflow-auto py-8">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects
            .filter(project => {
              if (!searchQuery) return true
              const query = searchQuery.toLowerCase()
              return (
                project.name?.toLowerCase().includes(query) ||
                project.title?.toLowerCase().includes(query) ||
                project.description?.toLowerCase().includes(query) ||
                project.project_type?.value?.toLowerCase().includes(query) ||
                project.stage?.value?.toLowerCase().includes(query) ||
                project.status?.value?.toLowerCase().includes(query)
              )
            })
            .map(project => (
            <div key={project.id} className="bg-white shadow hover:shadow-lg transition-shadow duration-200 w-full">
              {/* Project Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-4">
                {/* Description */}
                <div className="mb-3">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {project.description ? (
                      <>
                        {truncateText(stripHtmlTags(project.description), 50)}
                        {stripHtmlTags(project.description).length > 50 && (
                          <button
                            onClick={() => openDescriptionModal(project)}
                            className="text-gray-600 hover:text-gray-800 ml-1"
                          >
                            More
                          </button>
                        )}
                      </>
                    ) : (
                      'No description available'
                    )}
                  </p>
                </div>

                {/* Project Type, Estimated Hours, Duration, and Stage */}
                <div className="space-y-1 mb-3">
                  {project.project_type && getProjectTypeValue(project.project_type) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">Type:</span>
                      <span className="ml-1">{getProjectTypeValue(project.project_type)}</span>
                    </div>
                  )}
                  {project.estimated_hours && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Timer className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">Estimated Hours:</span>
                      <span className="ml-1">{project.estimated_hours}h</span>
                    </div>
                  )}
                  {project.duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">Duration:</span>
                      <span className="ml-1">{formatDuration(project.duration)}</span>
                    </div>
                  )}
                  {project.stage && getStageValue(project.stage) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Layers className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">Stage:</span>
                      <span className="ml-1">{getStageValue(project.stage)}</span>
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Created: {formatDate(project.created_at)}</span>
                  </div>
                </div>
              </div>


            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500">Get started by creating your first project.</p>
          </div>
        )}
        </div>
      </div>

      {/* Total Projects Count - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="text-sm text-gray-500">
          {searchQuery ? (
            <>
              Showing {projects.filter(project => {
                const query = searchQuery.toLowerCase()
                return (
                  project.name?.toLowerCase().includes(query) ||
                  project.title?.toLowerCase().includes(query) ||
                  project.description?.toLowerCase().includes(query) ||
                  project.project_type?.value?.toLowerCase().includes(query) ||
                  project.stage?.value?.toLowerCase().includes(query) ||
                  project.status?.value?.toLowerCase().includes(query)
                )
              }).length} of {projects.length} projects
            </>
          ) : (
            `Total Projects: ${projects.length}`
          )}
        </div>
      </div>

      {/* Description Modal */}
      {isDescriptionModalOpen && selectedProject && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={closeDescriptionModal}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-gray-600 text-sm">
              {stripHtmlTags(selectedProject.description) || 'No description available'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
