import { useState, useRef, useEffect } from 'react'
import { Employee } from '@/utils/api'

interface AvatarGroupProps {
  employees: Employee[]
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function AvatarGroup({ employees, maxVisible = 3, size = 'md' }: AvatarGroupProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const visibleEmployees = employees.slice(0, maxVisible)
  const remainingCount = employees.length - maxVisible

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  return (
    <div className="flex items-center relative" ref={dropdownRef}>
      {visibleEmployees.map((employee, index) => (
        <div
          key={`${employee.id}-${index}`}
          className={`
            ${sizeClasses[size]}
            ${index > 0 ? marginClasses[size] : ''}
            rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-white relative cursor-pointer
          `}
          style={{ backgroundColor: employee.color }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{employee.initials}</span>
          )}
          
          {/* Tooltip - only show for this specific avatar when hovered */}
          {hoveredIndex === index && (
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
              {employee.name}
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
            rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-gray-600 bg-gray-200 cursor-pointer relative hover:bg-gray-300 transition-colors
          `}
          onClick={(e) => {
            e.stopPropagation()
            setShowDropdown(!showDropdown)
          }}
          onMouseEnter={() => setHoveredIndex(-1)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <span>+{remainingCount}</span>

          {/* Tooltip - only show when dropdown is closed and this element is hovered */}
          {!showDropdown && hoveredIndex === -1 && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {remainingCount} more team members
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
      )}

      {/* Dropdown showing all assignees */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg py-2 min-w-48 z-20">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
            All Assignees ({employees.length})
          </div>
          <div className="max-h-60 overflow-y-auto">
            {employees.map((employee, index) => (
              <div
                key={`dropdown-${employee.id}-${index}`}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-white mr-3"
                  style={{ backgroundColor: employee.color }}
                >
                  {employee.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs">{employee.initials}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                  <div className="text-xs text-gray-500">{employee.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
