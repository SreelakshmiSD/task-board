"use client";

import React, { useState, useEffect } from 'react';
import { taskManagementServices, ApiTeamMember } from '@/lib/services/taskManagementServices';
import ProjectAssigneeDropdown from './ProjectAssigneeDropdown';

interface ProjectAssigneeManagerProps {
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  email?: string;
  projectId?: string | number;
  className?: string;
}

export default function ProjectAssigneeManager({
  maxVisible = 3,
  size = 'md',
  email,
  projectId,
  className = ''
}: ProjectAssigneeManagerProps) {
  const [teamMembers, setTeamMembers] = useState<ApiTeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current team members for the project
  const fetchTeamMembers = async () => {
    if (!email) {
      console.log('⚠️ ProjectAssigneeManager - No email provided, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 ProjectAssigneeManager - Fetching team members for project:', projectId);

      const teamResponse = await taskManagementServices.getTeamMembersList(email, projectId?.toString());

      if (teamResponse.status === 'success') {
        console.log('✅ ProjectAssigneeManager - Team members fetched successfully:', teamResponse.records?.length || 0);
        setTeamMembers(teamResponse.records || []);
      } else {
        setError(teamResponse.message);
        console.error('❌ ProjectAssigneeManager - Failed to fetch team members:', teamResponse.message);
      }
    } catch (err) {
      setError('Failed to fetch team members');
      console.error('❌ ProjectAssigneeManager - Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if email is provided
    if (email) {
      fetchTeamMembers();
    }
  }, [email, projectId]);

  // Handle assignee changes from the dropdown
  const handleAssigneesChange = async (newAssignees: ApiTeamMember[]) => {
    console.log('🔄 ProjectAssigneeManager - Updating project assignees:', newAssignees);

    try {
      // Update the local state immediately for optimistic UI
      setTeamMembers(newAssignees);

      console.log('✅ ProjectAssigneeManager - Project assignees updated successfully');

      // Optionally refresh the data from the server to ensure consistency
      // This will happen automatically when the component re-mounts or when projectId changes
    } catch (error) {
      console.error('❌ ProjectAssigneeManager - Error updating project assignees:', error);
      setError('Failed to update project assignees');

      // Refresh data from server on error to ensure consistency
      if (email && projectId) {
        fetchTeamMembers();
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="animate-pulse flex space-x-1">
          {[...Array(maxVisible)].map((_, i) => (
            <div
              key={i}
              className={`${getSizeClasses(size)} ${i > 0 ? getMarginClasses(size) : ''} rounded-full bg-gray-200`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <ProjectAssigneeDropdown
        currentAssignees={teamMembers}
        projectId={typeof projectId === 'string' ? parseInt(projectId) : projectId}
        email={email}
        onAssigneesChange={handleAssigneesChange}
        size={size}
      />
    </div>
  );
}

// Helper functions for size classes
function getSizeClasses(size: 'sm' | 'md' | 'lg') {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };
  return sizeClasses[size];
}

function getMarginClasses(size: 'sm' | 'md' | 'lg') {
  const marginClasses = {
    sm: '-ml-1',
    md: '-ml-2',
    lg: '-ml-3',
  };
  return marginClasses[size];
}
