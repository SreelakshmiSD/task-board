import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, Employee } from '@/utils/api'
import AvatarGroup from './AvatarGroup'
import { Calendar, MoreHorizontal, X } from 'lucide-react'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  employees: Employee[]
  onClick?: () => void
  viewMode?: 'status' | 'stage'
}

export default function TaskCard({ task, employees, onClick, viewMode = 'status' }: TaskCardProps) {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Convert API assignees to Employee format for AvatarGroup
  const assignedEmployees = task.assignees
    ? task.assignees.map(assignee => ({
        id: assignee.id,
        name: assignee.name,
        email: assignee.email,
        avatar: assignee.profile_pic,
        initials: assignee.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        color: `hsl(${assignee.id * 137.508}deg, 70%, 50%)` // Generate color based on ID
      }))
    : []

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'Product': 'bg-blue-100 text-blue-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Marketing': 'bg-purple-100 text-purple-800',
      'Sales': 'bg-green-100 text-green-800',
      'Research': 'bg-indigo-100 text-indigo-800',
      'Development': 'bg-yellow-100 text-yellow-800',
      'Testing': 'bg-red-100 text-red-800',
    }
    return colors[tag] || 'bg-gray-100 text-gray-800'
  }

  // Helper function to clean HTML content from CKEditor
  const cleanHtmlContent = (htmlContent: string) => {
    // Create a temporary div to decode HTML entities
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    // Get text content which automatically decodes HTML entities
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    return textContent.trim()
  }

  // Helper function to check if description needs truncation
  const shouldShowMore = (description: string) => {
    const cleanText = cleanHtmlContent(description)
    return cleanText.length > 25 // Show "More" if description is longer than 25 characters
  }

  // Helper function to get truncated description
  const getTruncatedDescription = (description: string) => {
    const cleanText = cleanHtmlContent(description)
    if (cleanText.length <= 25) return cleanText
    return cleanText.substring(0, 25) + '...'
  }

  // Helper functions to get values from API objects

  const getStageValue = (stage: any) => {
    return typeof stage === 'object' && stage?.value
      ? stage.value
      : (typeof stage === 'string' ? stage : '')
  }

  const getStatusValue = (status: any) => {
    return typeof status === 'object' && status?.value
      ? status.value
      : (typeof status === 'string' ? status : '')
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white shadow-sm border border-gray-200 p-3 cursor-grab active:cursor-grabbing
        hover:shadow-md transition-all duration-200 group
        ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
      `}
      onClick={(e) => {
        // Don't trigger card click if description modal is open or if clicking on More button
        if (showDescriptionModal || (e.target as HTMLElement).closest('button')) {
          return
        }
        onClick?.()
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-xs leading-tight flex-1 pr-2">
          {task.title}
        </h3>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded">
          <MoreHorizontal className="w-3 h-3 text-gray-400" />
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <div className="mb-2">
          <span className="text-xs text-gray-600 truncate block">
            {getTruncatedDescription(task.description)}
            {shouldShowMore(task.description) && (
              <span
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.nativeEvent.stopImmediatePropagation()
                  setShowDescriptionModal(true)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                className="text-xs text-gray-600 hover:text-gray-800 ml-1 cursor-pointer select-none"
              >
                More
              </span>
            )}
          </span>
        </div>
      )}

      {/* Progress - use time_percentages from API */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-700">{Math.round(task.time_percentages || 0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-300 bg-blue-500"
            style={{ width: `${Math.min(task.time_percentages || 0, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Tags - use stage and project as tags since API doesn't provide tags */}
      {(task.tags && task.tags.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Due Date */}
      {task.due_date && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{new Date(task.due_date).toLocaleDateString()}</span>
        </div>
      )}

      {/* Footer - Stage/Status and Assignees on same line */}
      <div className="flex items-center justify-between">
        {/* Stage or Status Info - left aligned based on viewMode */}
        <div>
          {viewMode === 'stage' ? (
            // When viewing by stage, show status
            getStatusValue(task.status) && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getStatusValue(task.status).trim()}
              </span>
            )
          ) : (
            // When viewing by status, show stage
            getStageValue(task.stage) && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {getStageValue(task.stage).trim()}
              </span>
            )
          )}
        </div>

        {/* Assignees - right aligned */}
        <div>
          {assignedEmployees.length > 0 && (
            <AvatarGroup employees={assignedEmployees} maxVisible={3} size="sm" />
          )}
        </div>
      </div>

      {/* Description Modal */}
      {showDescriptionModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setShowDescriptionModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Task Description</h3>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-80">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {cleanHtmlContent(task.description)}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
