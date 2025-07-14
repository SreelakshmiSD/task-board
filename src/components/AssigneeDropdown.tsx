import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, User, X } from 'lucide-react';
import { taskManagementServices, ApiTeamMember, ApiTaskAssignee } from '@/lib/services/taskManagementServices';

interface AssigneeDropdownProps {
  currentAssignees: ApiTaskAssignee[];
  taskId?: number;
  projectId?: string | number;
  email?: string;
  onAssigneesChange: (assignees: ApiTaskAssignee[]) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AssigneeDropdown({
  currentAssignees,
  taskId,
  projectId,
  email,
  onAssigneesChange,
  disabled = false,
  size = 'sm'
}: AssigneeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<ApiTeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [pendingAssignees, setPendingAssignees] = useState<ApiTaskAssignee[]>(currentAssignees);
  const [saving, setSaving] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const marginClasses = {
    sm: '-ml-1',
    md: '-ml-2',
    lg: '-ml-3',
  };

  // Update pending assignees when currentAssignees prop changes
  useEffect(() => {
    setPendingAssignees(currentAssignees);
  }, [currentAssignees]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Check if click is outside both the trigger and the dropdown
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
        setDropdownPosition(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
        setDropdownPosition(null);
      }
    }

    // Prevent background scrolling when dropdown is open
    function handleBackgroundWheel(event: WheelEvent) {
      if (isOpen) {
        // Only allow scrolling if the event target is within the dropdown
        const target = event.target as Element;
        if (!dropdownRef.current?.contains(target)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('wheel', handleBackgroundWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', handleBackgroundWheel);
    };
  }, [isOpen]);

  // Fetch team members when dropdown opens
  useEffect(() => {
    if (isOpen && teamMembers.length === 0) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await taskManagementServices.getTeamMembersList(email, projectId);
      if (response.status === 'success') {
        setTeamMembers(response.records);
      } else {
        console.error('Failed to fetch team members:', response.message);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter team members based on search query
  const filteredMembers = teamMembers.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const email = member.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Check if a member is currently assigned (check pending assignees for UI state)
  const isAssigned = (memberId: number) => {
    return pendingAssignees.some(assignee => assignee.id === memberId);
  };

  // Toggle assignee (update pending state only)
  const toggleAssignee = (member: ApiTeamMember) => {
    const isCurrentlyAssigned = isAssigned(member.id);

    let newAssignees: ApiTaskAssignee[];

    if (isCurrentlyAssigned) {
      // Remove assignee
      newAssignees = pendingAssignees.filter(assignee => assignee.id !== member.id);
    } else {
      // Add assignee
      const newAssignee: ApiTaskAssignee = {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        profile_pic: member.profile_pic || ''
      };
      newAssignees = [...pendingAssignees, newAssignee];
    }

    // Update pending state only (don't call onAssigneesChange yet)
    setPendingAssignees(newAssignees);
  };

  // Generate color for avatar
  const getColor = (id: number) => {
    return `hsl(${id * 137.508}deg, 70%, 50%)`;
  };

  // Get initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get visible assignees (limit display) - show current assignees in the trigger
  const maxVisible = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const visibleAssignees = currentAssignees.slice(0, maxVisible);
  const remainingCount = Math.max(0, currentAssignees.length - maxVisible);

  // Save assignees to API
  const handleSaveAssignees = async () => {
    if (!taskId || !email) {
      console.error('Missing taskId or email for saving assignees');
      return;
    }

    setSaving(true);

    try {
      // Find newly added assignees (those in pending but not in current)
      const assignUsers = pendingAssignees
        .filter(pending => !currentAssignees.some(current => current.id === pending.id))
        .map(assignee => assignee.id);

      // Find removed assignees (those in current but not in pending)
      const unassignUsers = currentAssignees
        .filter(current => !pendingAssignees.some(pending => pending.id === current.id))
        .map(assignee => assignee.id);

      console.log('🔄 Updating task assignments:', {
        taskId,
        assignUsers,
        unassignUsers,
        email
      });

      // Only make API call if there are changes
      if (assignUsers.length > 0 || unassignUsers.length > 0) {
        const response = await taskManagementServices.updateTaskAssignments(
          taskId,
          assignUsers,
          unassignUsers,
          email
        );

        if (response.status !== 'success') {
          console.error('Failed to update task assignments:', response);
          // Don't update UI if API call failed
          return;
        } else {
          console.log('✅ Successfully updated task assignments:', response);
        }
      } else {
        console.log('ℹ️ No changes to save');
      }

      // Update the parent component with the new assignees
      onAssigneesChange(pendingAssignees);

      // Close the dropdown
      setIsOpen(false);
      setDropdownPosition(null);

      console.log('✅ Assignees saved successfully');
    } catch (error) {
      console.error('❌ Error saving assignees:', error);
    } finally {
      setSaving(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    setPendingAssignees(currentAssignees);
    setIsOpen(false);
    setDropdownPosition(null);
  };

  const handleToggleDropdown = () => {
    if (disabled) return;

    if (!isOpen) {
      // Reset pending assignees to current when opening
      setPendingAssignees(currentAssignees);

      // Calculate position when opening - position below the entire task card
      if (triggerRef.current) {
        // Find the parent task card element
        const taskCard = triggerRef.current.closest('.task-card') || triggerRef.current.closest('[data-task-card]');

        if (taskCard) {
          const cardRect = taskCard.getBoundingClientRect();
          const dropdownHeight = 384; // max-h-96 = 384px
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - cardRect.bottom;
          const spaceAbove = cardRect.top;

          let top = cardRect.bottom + window.scrollY + 8;
          let left = cardRect.left + window.scrollX;

          // If there's not enough space below and more space above, position above
          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            top = cardRect.top + window.scrollY - dropdownHeight - 8;
          }

          // Ensure dropdown doesn't go off the right edge
          const dropdownWidth = 320; // w-80 = 320px
          if (left + dropdownWidth > window.innerWidth) {
            left = window.innerWidth - dropdownWidth - 16;
          }

          // Ensure dropdown doesn't go off the left edge
          if (left < 16) {
            left = 16;
          }

          setDropdownPosition({ top, left });
        } else {
          // Fallback to trigger position
          const rect = triggerRef.current.getBoundingClientRect();
          const dropdownHeight = 384;
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;

          let top = rect.bottom + window.scrollY + 8;
          let left = rect.left + window.scrollX;

          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            top = rect.top + window.scrollY - dropdownHeight - 8;
          }

          setDropdownPosition({ top, left });
        }
      }
      setSearchQuery('');
    } else {
      setDropdownPosition(null);
    }

    setIsOpen(!isOpen);
  };

  return (
    <div className="inline-block">
      {/* Assignee Display */}
      <div
        ref={triggerRef}
        className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
        onClick={handleToggleDropdown}
      >
        {currentAssignees.length > 0 ? (
          <div className="flex items-center">
            {visibleAssignees.map((assignee, index) => (
              <div
                key={assignee.id}
                className={`
                  ${sizeClasses[size]}
                  ${index > 0 ? marginClasses[size] : ''}
                  rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-white cursor-pointer relative
                `}
                style={{ backgroundColor: getColor(assignee.id) }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {assignee.profile_pic ? (
                  <img
                    src={assignee.profile_pic}
                    alt={assignee.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{getInitials(assignee.name.split(' ')[0] || '', assignee.name.split(' ')[1] || '')}</span>
                )}

                {/* Tooltip - only show for this specific assignee when hovered */}
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
                    {assignee.name}
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
                  rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-white bg-gray-500 cursor-pointer relative
                `}
                onMouseEnter={() => setHoveredIndex(-1)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span>+{remainingCount}</span>

                {/* Tooltip for remaining count */}
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
                    {remainingCount} more assignee{remainingCount > 1 ? 's' : ''}
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
        ) : (
          <div className="flex items-center text-gray-400">
            <User className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
          </div>
        )}
      </div>

      {/* Dropdown Panel */}
      {isOpen && !disabled && dropdownPosition && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 shadow-xl rounded-lg w-80 flex flex-col z-[9999] overflow-hidden"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            maxHeight: Math.min(384, window.innerHeight - 32), // Ensure it fits in viewport with padding
            minHeight: '200px' // Ensure minimum height for usability
          }}
          onWheel={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onScroll={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Assign Team Members</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setDropdownPosition(null);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Members List */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{
              maxHeight: 'calc(100% - 120px)', // Reserve space for header (60px) and footer (60px)
              minHeight: '120px' // Ensure minimum usable height
            }}
            onWheel={(e) => {
              e.stopPropagation();
              e.preventDefault();

              // Handle scrolling manually within the dropdown only
              const element = e.currentTarget;
              const { scrollTop, scrollHeight, clientHeight } = element;
              const scrollAmount = e.deltaY;

              // Only scroll if there's content to scroll
              if (scrollHeight > clientHeight) {
                const newScrollTop = Math.max(0, Math.min(scrollHeight - clientHeight, scrollTop + scrollAmount));
                element.scrollTop = newScrollTop;
              }
            }}
            onTouchMove={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                <span className="text-xs">Loading members...</span>
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="py-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleAssignee(member)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-white mr-3 flex-shrink-0"
                      style={{ backgroundColor: getColor(member.id) }}
                    >
                      {member.profile_pic ? (
                        <img
                          src={member.profile_pic}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs">{getInitials(member.first_name, member.last_name)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {member.email}
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-2">
                      <input
                        type="checkbox"
                        checked={isAssigned(member.id)}
                        onChange={() => {}} // Handled by parent click
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <User className="w-8 h-8 mb-2 text-gray-300" />
                <span className="text-xs">
                  {searchQuery ? 'No members found' : 'No team members available'}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-3 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAssignees}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
