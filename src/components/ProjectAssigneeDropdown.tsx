"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { ApiTeamMember, taskManagementServices } from '@/lib/services/taskManagementServices';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_pic?: string;
}

interface ProjectAssigneeDropdownProps {
  currentAssignees: ApiTeamMember[];
  projectId?: number;
  email?: string;
  onAssigneesChange?: (assignees: ApiTeamMember[]) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProjectAssigneeDropdown({
  currentAssignees,
  projectId,
  email,
  onAssigneesChange,
  disabled = false,
  size = 'sm'
}: ProjectAssigneeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [pendingAssignees, setPendingAssignees] = useState<ApiTeamMember[]>(currentAssignees);
  const [saving, setSaving] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Calculate tooltip position to avoid going off-screen
  const calculateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 120; // Approximate tooltip width
    const tooltipHeight = 32; // Approximate tooltip height

    let top = rect.top - tooltipHeight - 8; // 8px gap above element
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2); // Center horizontally

    // Adjust if tooltip would go off the left edge
    if (left < 8) {
      left = 8;
    }

    // Adjust if tooltip would go off the right edge
    if (left + tooltipWidth > window.innerWidth - 8) {
      left = window.innerWidth - tooltipWidth - 8;
    }

    // Adjust if tooltip would go off the top edge
    if (top < 8) {
      top = rect.bottom + 8; // Show below element instead
    }

    return { top, left };
  };

  // Size classes for avatars
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const marginClasses = {
    sm: '-ml-1',
    md: '-ml-2',
    lg: '-ml-2'
  };

  // Generate color for user based on ID
  const getColor = (id: number) => {
    const colors = [
      '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    return colors[id % colors.length];
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Convert User to ApiTeamMember format
  const convertUserToTeamMember = (user: User): ApiTeamMember => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    profile_pic: user.profile_pic || null,
    company: null
  });

  // Fetch all users from masters-list API
  const fetchUsers = async () => {
    if (!email) return;

    setLoading(true);
    try {
      console.log('🔄 Fetching users for project assignment...');
      
      const response = await fetch(`/api/masters-list?action=users`);
      const data = await response.json();

      if (data.status === 'success' && data.records) {
        console.log('✅ Users fetched successfully:', data.records.length);
        setUsers(data.records);
      } else {
        console.error('❌ Failed to fetch users:', data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 300; // Estimated dropdown height

    let top = triggerRect.bottom + window.scrollY + 8;
    let left = triggerRect.left + window.scrollX;

    // Check if dropdown would go below viewport
    if (triggerRect.bottom + dropdownHeight > viewportHeight) {
      top = triggerRect.top + window.scrollY - dropdownHeight - 8;
    }

    // Ensure dropdown doesn't go off-screen horizontally
    const dropdownWidth = 280;
    if (left + dropdownWidth > window.innerWidth) {
      left = window.innerWidth - dropdownWidth - 16;
    }

    setDropdownPosition({ top, left });
  };

  // Handle dropdown toggle
  const handleToggleDropdown = () => {
    if (disabled) return;

    if (!isOpen) {
      fetchUsers();
      calculateDropdownPosition();
      setPendingAssignees([...currentAssignees]);
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle user selection toggle
  const toggleUser = (user: User) => {
    const teamMember = convertUserToTeamMember(user);
    const isSelected = pendingAssignees.some(a => a.id === user.id);

    if (isSelected) {
      setPendingAssignees(prev => prev.filter(a => a.id !== user.id));
    } else {
      setPendingAssignees(prev => [...prev, teamMember]);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!projectId || !email) {
      console.error('❌ Missing projectId or email for saving assignees');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving project assignees...', {
        projectId,
        currentAssignees: currentAssignees.map(a => a.id),
        pendingAssignees: pendingAssignees.map(a => a.id)
      });

      // Calculate which users to assign and unassign
      const currentIds = new Set(currentAssignees.map(a => a.id));
      const pendingIds = new Set(pendingAssignees.map(a => a.id));

      const toAssign = pendingAssignees.filter(a => !currentIds.has(a.id)).map(a => a.id);
      const toUnassign = currentAssignees.filter(a => !pendingIds.has(a.id)).map(a => a.id);

      console.log('📊 Assignment changes:', { toAssign, toUnassign });

      // Only make API call if there are changes
      if (toAssign.length > 0 || toUnassign.length > 0) {
        const response = await taskManagementServices.updateProjectAssignments(
          projectId,
          toAssign,
          toUnassign,
          email
        );

        if (response.status === 'success') {
          console.log('✅ Project assignees saved successfully');

          // Update the parent component with the new assignees
          if (onAssigneesChange) {
            onAssigneesChange(pendingAssignees);
          }
        } else {
          console.error('❌ Failed to save project assignees:', response.message);
          // Reset pending assignees to current state on error
          setPendingAssignees(currentAssignees);
          return;
        }
      } else {
        console.log('ℹ️ No changes to save');

        // Still call the callback to ensure UI consistency
        if (onAssigneesChange) {
          onAssigneesChange(pendingAssignees);
        }
      }

      setIsOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('❌ Error saving project assignees:', error);
      // Reset pending assignees to current state on error
      setPendingAssignees(currentAssignees);
    } finally {
      setSaving(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    setPendingAssignees([...currentAssignees]);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Visible assignees (limit display)
  const maxVisible = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const visibleAssignees = currentAssignees.slice(0, maxVisible);
  const remainingCount = currentAssignees.length - maxVisible;

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
                onMouseEnter={(e) => {
                  console.log('🐭 Mouse enter on assignee:', index, assignee);
                  setHoveredIndex(index);
                  const position = calculateTooltipPosition(e.currentTarget as HTMLElement);
                  console.log('📍 Tooltip position:', position);
                  setTooltipPosition(position);
                }}
                onMouseLeave={() => {
                  console.log('🐭 Mouse leave on assignee:', index);
                  setHoveredIndex(null);
                  setTooltipPosition(null);
                }}
              >
                {assignee.profile_pic ? (
                  <img
                    src={assignee.profile_pic}
                    alt={`${assignee.first_name} ${assignee.last_name}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{getInitials(assignee.first_name || '', assignee.last_name || '')}</span>
                )}
              </div>
            ))}

            {remainingCount > 0 && (
              <div
                className={`
                  ${sizeClasses[size]}
                  ${marginClasses[size]}
                  rounded-full border-2 border-white shadow-sm flex items-center justify-center font-medium text-gray-600 bg-gray-100 cursor-pointer
                `}
                onMouseEnter={(e) => {
                  setHoveredIndex(-1);
                  const position = calculateTooltipPosition(e.currentTarget as HTMLElement);
                  setTooltipPosition(position);
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setTooltipPosition(null);
                }}
              >
                <span>+{remainingCount}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center text-gray-500 hover:text-gray-700">
            <div className={`${sizeClasses[size]} rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center`}>
              <span className="text-gray-400">+</span>
            </div>
            <span className="ml-2 text-sm">Assign members</span>
          </div>
        )}
      </div>

      {/* Dropdown Portal */}
      {isOpen && dropdownPosition && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 shadow-lg rounded-lg z-50 w-72"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
          onTouchMove={(e) => e.stopPropagation()}
          onScroll={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Assign Team Members</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                <span className="text-xs">Loading members...</span>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="py-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleUser(user)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-white mr-3 flex-shrink-0"
                      style={{ backgroundColor: getColor(user.id) }}
                    >
                      {user.profile_pic ? (
                        <img
                          src={user.profile_pic}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{getInitials(user.first_name, user.last_name)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>

                    <div className="ml-2 flex-shrink-0">
                      {pendingAssignees.some(a => a.id === user.id) ? (
                        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                <span className="text-sm">No members found</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500">
              {pendingAssignees.length} member{pendingAssignees.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltipPosition && hoveredIndex !== null && (
        <div
          className="fixed bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-[9999] pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          {hoveredIndex === -1
            ? `${remainingCount} more member(s)`
            : `${currentAssignees[hoveredIndex]?.first_name || ''} ${currentAssignees[hoveredIndex]?.last_name || ''}`.trim()
          }
        </div>
      )}
    </div>
  );
}
