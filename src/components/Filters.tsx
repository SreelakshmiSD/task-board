'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Search,
  ChevronDown,
  Filter,
  X,
  Calendar,
  User,
  Flag,
  CheckCircle2,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Assignee {
  id: number;
  name: string;
  email: string;
  profile_pic?: string;
}

interface Priority {
  id: number;
  value: string;
}

interface Status {
  id: number;
  value: string;
}

interface DetailFilters {
  priorities: string[];
  statuses: string[];
  assignees: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  viewMode: "status" | "stage";
  onViewModeChange: (mode: "status" | "stage") => void;
  projects?: Project[];
  projectsLoaded?: boolean;
  // New detailed filter props
  detailFilters?: DetailFilters;
  onDetailFiltersChange?: (filters: DetailFilters) => void;
  availableAssignees?: Assignee[];
  availablePriorities?: Priority[];
  availableStatuses?: Status[];
}

// Default projects for fallback (without "All Projects" option)
const defaultProjects = [
  { value: "mobile-app", label: "Mobile App Redesign" },
  { value: "customer-feedback", label: "Customer Feedback Analysis" },
  { value: "enterprise-sales", label: "Enterprise Sales Pitch" },
  { value: "website-redesign", label: "Website Redesign" },
  { value: "q4-marketing", label: "Q4 Marketing Campaign" },
];

export default function Filters({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  viewMode,
  onViewModeChange,
  projects = [],
  projectsLoaded = false,
  detailFilters,
  onDetailFiltersChange,
  availableAssignees = [],
  availablePriorities = [],
  availableStatuses = [],
}: FiltersProps) {
  // State for dropdowns
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [isDetailFiltersOpen, setIsDetailFiltersOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

  // Refs for dropdowns
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const detailFiltersRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
        setProjectSearchQuery("");
      }
      if (
        detailFiltersRef.current &&
        !detailFiltersRef.current.contains(event.target as Node)
      ) {
        setIsDetailFiltersOpen(false);
      }
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPriorityDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAssigneeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Create project options from API data (without "All Projects" option)
  const projectOptions = [
    ...(projects || []).map((project) => ({
      value: project.name,
      label: project.name,
    })),
  ];

  // Use API projects if loaded, otherwise fall back to default only if not loaded yet
  const availableProjects = projectsLoaded ? projectOptions : defaultProjects;

  // Filter projects based on search query
  const filteredProjects = availableProjects.filter((project) =>
    project.label.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  // Get selected project label
  const selectedProjectLabel =
    availableProjects.find((p) => p.value === selectedProject)?.label ||
    "Select Project";

  // Debug project selection
  console.log("🔍 Filters - Project selection debug:", {
    selectedProject,
    availableProjectsCount: availableProjects.length,
    availableProjects: availableProjects.map((p) => p.value),
    selectedProjectLabel,
    projectsLoaded,
  });

  // Handle project selection
  const handleProjectSelect = (projectValue: string) => {
    onProjectChange(projectValue);
    setIsProjectDropdownOpen(false);
    setProjectSearchQuery("");
  };

  // Helper functions for detailed filters
  const updateDetailFilters = (updates: Partial<DetailFilters>) => {
    if (onDetailFiltersChange && detailFilters) {
      onDetailFiltersChange({ ...detailFilters, ...updates });
    }
  };

  const toggleArrayFilter = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter((item) => item !== value)
      : [...array, value];
  };

  const handlePriorityToggle = (priority: string) => {
    if (detailFilters) {
      updateDetailFilters({
        priorities: toggleArrayFilter(detailFilters.priorities, priority),
      });
    }
  };

  const handleStatusToggle = (status: string) => {
    if (detailFilters) {
      updateDetailFilters({
        statuses: toggleArrayFilter(detailFilters.statuses, status),
      });
    }
  };

  const handleAssigneeToggle = (assigneeId: string) => {
    if (detailFilters) {
      updateDetailFilters({
        assignees: toggleArrayFilter(detailFilters.assignees, assigneeId),
      });
    }
  };

  const clearAllFilters = () => {
    if (onDetailFiltersChange) {
      onDetailFiltersChange({
        priorities: [],
        statuses: [],
        assignees: [],
        dateRange: { start: null, end: null },
      });
    }
  };

  // Count active filters
  const activeFiltersCount = detailFilters
    ? detailFilters.priorities.length +
      detailFilters.statuses.length +
      detailFilters.assignees.length +
      (detailFilters.dateRange.start || detailFilters.dateRange.end ? 1 : 0)
    : 0;

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
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isProjectDropdownOpen ? "rotate-180" : ""
                }`}
              />
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
                          selectedProject === project.value
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-700"
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
                onClick={() => onViewModeChange("status")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === "status"
                    ? "bg-white shadow text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Status
              </button>
              <button
                onClick={() => onViewModeChange("stage")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === "stage"
                    ? "bg-white shadow text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
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

          {/* Detail Filters Button */}
          {onDetailFiltersChange && (
            <div className="relative" ref={detailFiltersRef}>
              <button
                onClick={() => setIsDetailFiltersOpen(!isDetailFiltersOpen)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  activeFiltersCount > 0
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Detail Filters Dropdown */}
              {isDetailFiltersOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-80">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Filter Tasks
                      </h3>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Priority Filter */}
                      {availablePriorities.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-700 flex items-center">
                              <Flag className="w-3 h-3 mr-1" />
                              Priority
                            </label>
                          </div>
                          <div className="space-y-1">
                            {availablePriorities.map((priority) => (
                              <label
                                key={priority.id}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    detailFilters?.priorities.includes(
                                      priority.value
                                    ) || false
                                  }
                                  onChange={() =>
                                    handlePriorityToggle(priority.value)
                                  }
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                  {priority.value}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Filter */}
                      {availableStatuses.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-700 flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Status
                            </label>
                          </div>
                          <div className="space-y-1">
                            {availableStatuses.map((status) => (
                              <label
                                key={status.id}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    detailFilters?.statuses.includes(
                                      status.value
                                    ) || false
                                  }
                                  onChange={() =>
                                    handleStatusToggle(status.value)
                                  }
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                  {status.value}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assignee Filter */}
                      {availableAssignees.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-700 flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              Assignees
                            </label>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {availableAssignees.map((assignee) => (
                              <label
                                key={assignee.id}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    detailFilters?.assignees.includes(
                                      assignee.id.toString()
                                    ) || false
                                  }
                                  onChange={() =>
                                    handleAssigneeToggle(assignee.id.toString())
                                  }
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                                />
                                <div className="flex items-center space-x-2">
                                  {assignee.profile_pic ? (
                                    <img
                                      src={assignee.profile_pic}
                                      alt={assignee.name}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                      {assignee.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </div>
                                  )}
                                  <span className="text-sm text-gray-700">
                                    {assignee.name}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
