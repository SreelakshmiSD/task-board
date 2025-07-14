import { useState, useEffect, useRef } from 'react'
import { taskManagementServices, ApiTeamMember, Task } from '@/lib/services/taskManagementServices'

interface AssigneeListProps {
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  email?: string
  projectId?: string | number
  className?: string
}

export default function AssigneeList({
  maxVisible = 3,
  size = 'md',
  email,
  projectId,
  className = ''
}: AssigneeListProps) {
  const [teamMembers, setTeamMembers] = useState<ApiTeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [profilePictures, setProfilePictures] = useState<Record<number, string>>({})
  const [tooltipPosition, setTooltipPosition] = useState<{top: number, left: number} | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const visibleMembers = teamMembers.slice(0, maxVisible)
  const remainingCount = teamMembers.length - maxVisible

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  const marginClasses = {
    sm: '-ml-1',
    md: '-ml-2',
    lg: '-ml-3',
  }

  // Generate initials from first and last name
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const calculateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const tooltipHeight = 40 // Approximate tooltip height
    const tooltipWidth = 150 // Approximate tooltip width

    let top = rect.top - tooltipHeight - 8 // Position above the element
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2) // Center horizontally

    // Ensure tooltip doesn't go off the top of the screen
    if (top < 8) {
      top = rect.bottom + 8 // Position below if not enough space above
    }

    // Ensure tooltip doesn't go off the left edge
    if (left < 8) {
      left = 8
    }

    // Ensure tooltip doesn't go off the right edge
    if (left + tooltipWidth > window.innerWidth - 8) {
      left = window.innerWidth - tooltipWidth - 8
    }

    return { top, left }
  }

  // Generate a consistent color based on the member's ID
  const getColor = (id: number): string => {
    const colors = [
      '#10B981', // green
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#F59E0B', // amber
      '#EF4444', // red
      '#06B6D4', // cyan
      '#84CC16', // lime
      '#F97316', // orange
      '#EC4899', // pink
      '#6366F1', // indigo
    ]
    return colors[id % colors.length]
  }

  // Fetch team members and profile pictures
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch team members with project ID if provided
        const teamResponse = await taskManagementServices.getTeamMembersList(email, projectId)

        if (teamResponse.status === 'success') {
          setTeamMembers(teamResponse.records)
          console.log('🔍 AssigneeList - Fetched team members for project:', projectId, 'Count:', teamResponse.records.length)

          // Fetch tasks to get profile pictures from assignees
          const tasksResponse = await taskManagementServices.getTasksList(email)
          if (tasksResponse.status === 'success') {
            const profilePics: Record<number, string> = {}

            // Extract profile pictures from all task assignees
            tasksResponse.records.forEach((task: Task) => {
              if (task.assignees) {
                task.assignees.forEach(assignee => {
                  if (assignee.profile_pic && !profilePics[assignee.id]) {
                    profilePics[assignee.id] = assignee.profile_pic
                  }
                })
              }
            })

            setProfilePictures(profilePics)
          }
        } else {
          setError(teamResponse.message)
          console.error('❌ AssigneeList - Failed to fetch team members:', teamResponse.message)
        }
      } catch (err) {
        setError('Failed to fetch team members')
        console.error('❌ AssigneeList - Error fetching team members:', err)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if email is provided
    if (email) {
      fetchData()
    }
  }, [email, projectId])

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="animate-pulse flex space-x-1">
          {[...Array(maxVisible)].map((_, i) => (
            <div
              key={i}
              className={`${sizeClasses[size]} ${i > 0 ? marginClasses[size] : ''} rounded-full bg-gray-200`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error: {error}
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      {visibleMembers.map((member, index) => (
        <div
          key={member.id}
          data-member-id={member.id}
          className={`
            ${sizeClasses[size]}
            ${index > 0 ? marginClasses[size] : ''}
            rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-white cursor-pointer relative
          `}
          style={{ backgroundColor: getColor(member.id) }}
          onMouseEnter={(e) => {
            setHoveredIndex(index)
            const position = calculateTooltipPosition(e.currentTarget as HTMLElement)
            setTooltipPosition(position)
          }}
          onMouseLeave={() => {
            setHoveredIndex(null)
            setTooltipPosition(null)
          }}
        >
          {(member.profile_pic || profilePictures[member.id]) ? (
            <img
              src={member.profile_pic || profilePictures[member.id]}
              alt={`${member.first_name} ${member.last_name}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{getInitials(member.first_name, member.last_name)}</span>
          )}

          {/* Custom Tooltip - only show for this specific member when hovered */}
          {hoveredIndex === index && tooltipPosition && (
            <div
              ref={tooltipRef}
              className="fixed px-3 py-2 bg-gray-800 text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg"
              style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                minWidth: 'max-content',
                width: 'max-content',
                maxWidth: 'none'
              }}
            >
              {member.first_name} {member.last_name}
              <div
                className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"
              ></div>
            </div>
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          data-remaining-count="true"
          className={`
            ${sizeClasses[size]}
            ${marginClasses[size]}
            rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-gray-600 bg-gray-200 cursor-pointer relative
          `}
          onMouseEnter={(e) => {
            setHoveredIndex(-1)
            const position = calculateTooltipPosition(e.currentTarget as HTMLElement)
            setTooltipPosition(position)
          }}
          onMouseLeave={() => {
            setHoveredIndex(null)
            setTooltipPosition(null)
          }}
        >
          <span>+{remainingCount}</span>

          {/* Custom Tooltip for remaining count */}
          {hoveredIndex === -1 && tooltipPosition && (
            <div
              className="fixed px-3 py-2 bg-gray-800 text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg"
              style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                minWidth: 'max-content',
                width: 'max-content',
                maxWidth: 'none'
              }}
            >
              {remainingCount} more team members
              <div
                className="absolute top-full left-4 border-4 border-transparent border-t-gray-800"
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
