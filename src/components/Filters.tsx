'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface Project {
  id: number
  name: string
  description: string
  status: string
  created_at: string
  updated_at: string
}



interface FiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedProject: string
  onProjectChange: (project: string) => void
  viewMode: 'status' | 'stage'
  onViewModeChange: (mode: 'status' | 'stage') => void
  projects?: Project[]
  projectsLoaded?: boolean // New prop to indicate if projects have been loaded from API
}

// Default projects for fallback (without "All Projects" option)
const defaultProjects = [
  { value: 'mobile-app', label: 'Mobile App Redesign' },
  { value: 'customer-feedback', label: 'Customer Feedback Analysis' },
  { value: 'enterprise-sales', label: 'Enterprise Sales Pitch' },
  { value: 'website-redesign', label: 'Website Redesign' },
  { value: 'q4-marketing', label: 'Q4 Marketing Campaign' },
]



export default function Filters({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  viewMode,
  onViewModeChange,
  projects = [],
  projectsLoaded = false,
}: FiltersProps) {
  // State for searchable project dropdown
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [projectSearchQuery, setProjectSearchQuery] = useState('')
  const projectDropdownRef = useRef<HTMLDivElement>(null)



  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false)
        setProjectSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  // Create project options from API data (without "All Projects" option)
  const projectOptions = [
    ...(projects || []).map(project => ({
      value: project.name,
      label: project.name
    }))
  ]

  // Use API projects if loaded, otherwise fall back to default only if not loaded yet
  const availableProjects = projectsLoaded ? projectOptions : defaultProjects



  // Filter projects based on search query
  const filteredProjects = availableProjects.filter(project =>
    project.label.toLowerCase().includes(projectSearchQuery.toLowerCase())
  )

  // Get selected project label
  const selectedProjectLabel = availableProjects.find(p => p.value === selectedProject)?.label || 'Select Project'

  // Debug project selection
  console.log('🔍 Filters - Project selection debug:', {
    selectedProject,
    availableProjectsCount: availableProjects.length,
    availableProjects: availableProjects.map(p => p.value),
    selectedProjectLabel,
    projectsLoaded
  });

  // Handle project selection
  const handleProjectSelect = (projectValue: string) => {
    onProjectChange(projectValue)
    setIsProjectDropdownOpen(false)
    setProjectSearchQuery('')
  }



  // Clear filters function and hasActiveFilters removed since clear button is not needed

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side - Project and View Toggle */}
        <div className="flex items-center space-x-4">
          {/* Project Selection - Searchable Dropdown */}
          <div className="relative" ref={projectDropdownRef}>
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center justify-between bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px]"
            >
              <span className="truncate">{selectedProjectLabel}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                    />
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Project Options */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <button
                        key={project.value}
                        onClick={() => handleProjectSelect(project.value)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          selectedProject === project.value ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                        }`}
                      >
                        {project.label}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No projects found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View by:</span>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => onViewModeChange('status')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'status'
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Status
              </button>
              <button
                onClick={() => onViewModeChange('stage')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'stage'
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Stages
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Search and Filters */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>



          {/* Clear filters button - removed */}
        </div>
      </div>
    </div>
  )
}
