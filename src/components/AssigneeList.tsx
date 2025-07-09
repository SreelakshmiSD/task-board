import { useState, useEffect, useRef } from 'react'
import { taskManagementServices, ApiTeamMember, Task } from '@/lib/services/taskManagementServices'

interface AssigneeListProps {
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  email?: string
  className?: string
}

export default function AssigneeList({
  maxVisible = 3,
  size = 'md',
  email,
  className = ''
}: AssigneeListProps) {
  const [teamMembers, setTeamMembers] = useState<ApiTeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [profilePictures, setProfilePictures] = useState<Record<number, string>>({})
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
        // Fetch team members
        const teamResponse = await taskManagementServices.getTeamMembersList(email)

        if (teamResponse.status === 'success') {
          setTeamMembers(teamResponse.records)

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
        }
      } catch (err) {
        setError('Failed to fetch team members')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [email])

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
          className={`
            ${sizeClasses[size]}
            ${index > 0 ? marginClasses[size] : ''}
            rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-white cursor-pointer relative
          `}
          style={{ backgroundColor: getColor(member.id) }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
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
          {hoveredIndex === index && (
            <div
              ref={tooltipRef}
              className="absolute bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg"
              style={{
                right: '0',
                transform: 'none',
                minWidth: 'max-content',
                width: 'max-content',
                maxWidth: 'none'
              }}
            >
              {member.first_name} {member.last_name}
              <div
                className="absolute top-full border-4 border-transparent border-t-gray-800"
                style={{
                  right: '16px',
                  transform: 'none'
                }}
              ></div>
            </div>
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`
            ${sizeClasses[size]}
            ${marginClasses[size]}
            rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-gray-600 bg-gray-200 cursor-pointer relative
          `}
          onMouseEnter={() => setHoveredIndex(-1)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <span>+{remainingCount}</span>

          {/* Custom Tooltip for remaining count */}
          {hoveredIndex === -1 && (
            <div
              className="absolute bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg"
              style={{
                right: '0',
                transform: 'none',
                minWidth: 'max-content',
                width: 'max-content',
                maxWidth: 'none'
              }}
            >
              {remainingCount} more team members
              <div
                className="absolute top-full border-4 border-transparent border-t-gray-800"
                style={{
                  right: '16px',
                  transform: 'none'
                }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
