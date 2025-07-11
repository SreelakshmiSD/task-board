'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, User, MessageCircle, Clock, CheckCircle2 } from 'lucide-react'
import { Task, ApiTaskAssignee } from '@/lib/services/taskManagementServices'

interface TaskOverviewProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}



export default function TaskOverview({ task, isOpen, onClose }: TaskOverviewProps) {

  // Helper function to clean HTML content from CKEditor
  const cleanHtmlContent = (htmlContent: string) => {
    // Create a temporary div to decode HTML entities
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    // Get text content which automatically decodes HTML entities
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    return textContent.trim()
  }

  const getProjectName = (project: any): string => {
    if (typeof project === 'string') return project
    if (project && typeof project === 'object' && project.value) return project.value
    return 'Unknown Project'
  }

  const getStatusValue = (status: any): string => {
    if (typeof status === 'string') return status
    if (status && typeof status === 'object' && status.value) return status.value
    return 'Pending'
  }

  const getStageValue = (stage: any): string => {
    if (typeof stage === 'string') return stage
    if (stage && typeof stage === 'object' && stage.value) return stage.value.trim()
    return 'Unknown Stage'
  }

  const getPriorityValue = (priority: any): string => {
    if (typeof priority === 'string') return priority
    if (priority && typeof priority === 'object' && priority.value) return priority.value
    return 'Medium'
  }

  const getStatusColor = (status: any): string => {
    const statusValue = getStatusValue(status).toLowerCase()
    switch (statusValue) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on-going': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: any): string => {
    const priorityValue = getPriorityValue(priority).toLowerCase()
    switch (priorityValue) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen || !task) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-end z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-96 shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {task.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Description */}
          <div className="text-gray-600 text-sm mb-6">
            {cleanHtmlContent(task.description || "")}
          </div>

          {/* Project Information */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Project</h3>
            <span className="text-sm text-gray-900">
              {getProjectName(task.project)}
            </span>
          </div>

          {/* Stage */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Stage</h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {getStageValue(task.stage)}
            </span>
          </div>

          {/* Status */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {getStatusValue(task.status)}
            </span>
          </div>

          {/* Priority */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {getPriorityValue(task.priority)}
            </span>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(task.time_percentages || 0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(task.time_percentages || 0, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Assigned To */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Assigned To
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              {task.assignees && task.assignees.length > 0 ? (
                task.assignees.map((assignee, index) => (
                  <div
                    key={assignee.id}
                    className="flex items-center space-x-2"
                  >
                    {assignee.profile_pic ? (
                      <img
                        src={assignee.profile_pic}
                        alt={assignee.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                        {assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    )}
                    <span className="text-sm text-gray-700 whitespace-nowrap">
                      {assignee.name}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-500">No assignees</span>
              )}
            </div>
          </div>
        </div>

        {/* Subtasks Section */}
        {task.sub_tasks && task.sub_tasks.length > 0 && (
          <div className="p-6 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Subtasks ({task.sub_tasks.length})
            </h3>

            <div className="space-y-3">
              {task.sub_tasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Status indicator */}
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        subtask.status.value === "Completed"
                          ? "bg-green-500"
                          : subtask.status.value === "On-going"
                          ? "bg-blue-500"
                          : subtask.status.value === "Pending"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    />

                    {/* Subtask name */}
                    <span
                      className={`text-sm font-medium flex-1 ${
                        subtask.status.value === "Completed"
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {subtask.name}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                        subtask.status.value === "Completed"
                          ? "bg-green-100 text-green-800"
                          : subtask.status.value === "On-going"
                          ? "bg-blue-100 text-blue-800"
                          : subtask.status.value === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {subtask.status.value}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-500 flex-shrink-0 ml-4">
                    {/* Created by */}
                    <div className="flex items-center space-x-1">
                      {subtask.created_by.profile_pic ? (
                        <img
                          src={subtask.created_by.profile_pic}
                          alt={subtask.created_by.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          {subtask.created_by.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <span className="hidden sm:inline">
                        {subtask.created_by.name}
                      </span>
                    </div>

                    {/* Created date */}
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">
                      {subtask.created_at}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Section */}
        <div className="p-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>

          <div className="space-y-3">
            {/* Update Link */}
            <a
              href="#"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Update Task</span>
            </a>

            {/* Delete Link */}
            <a
              href="#"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Delete Task</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
