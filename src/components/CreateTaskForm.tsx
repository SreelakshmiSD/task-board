"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTaskManagement } from "@/lib/hooks/useTaskManagement";
import {
  taskManagementServices,
  ApiTeamMember,
} from "@/lib/services/taskManagementServices";
import { X } from "lucide-react";

interface CreateTaskFormProps {
  onClose: () => void;
  initialStatus?: string;
  initialStage?: string;
  onTaskCreated?: () => void; // Callback to refresh parent component's task list
  defaultValues?: {
    title?: string;
    description?: string;
    progress?: number;
    priority?: string;
    estimated_hours?: string;
  };
}

export default function CreateTaskForm({
  onClose,
  initialStatus,
  initialStage,
  onTaskCreated,
  defaultValues,
}: CreateTaskFormProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const {
    projects,
    stages,
    statuses,
    priorities,
    teamMembers,
    createTask,
    loading,
    refetch,
  } = useTaskManagement({
    autoFetch: true,
    email: userEmail || undefined,
  });

  // State for real team members
  const [realTeamMembers, setRealTeamMembers] = useState<ApiTeamMember[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);

  // Fetch team members directly
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!userEmail) return;

      setTeamMembersLoading(true);
      console.log("🔄 CreateTaskForm - Fetching team members for:", userEmail);

      try {
        const response = await taskManagementServices.getTeamMembersList(
          userEmail
        );
        console.log("✅ CreateTaskForm - Team members response:", response);

        if (response.status === "success" && response.records.length > 0) {
          setRealTeamMembers(response.records);
          console.log(
            "🎯 CreateTaskForm - Real team members loaded:",
            response.records
          );
        } else {
          console.log(
            "⚠️ CreateTaskForm - No team members from API, using fallback"
          );
        }
      } catch (error) {
        console.error(
          "❌ CreateTaskForm - Error fetching team members:",
          error
        );
      } finally {
        setTeamMembersLoading(false);
      }
    };

    fetchTeamMembers();
  }, [userEmail]);

  // Debug logging
  useEffect(() => {
    console.log("🔍 CreateTaskForm - Hook team members:", teamMembers);
    console.log("🔍 CreateTaskForm - Real team members:", realTeamMembers);
    console.log("🔍 CreateTaskForm - User email:", userEmail);
    console.log("🔍 CreateTaskForm - Loading:", loading);
  }, [teamMembers, realTeamMembers, userEmail, loading]);

  // Fallback data when API is not available
  const fallbackProjects = [
    { id: 319, name: "HR Portal E8" },
    { id: 9, name: "Workflow" },
  ];

  const fallbackStatuses = [
    { id: "1", name: "Pending" },
    { id: "2", name: "On-going" },
    { id: "3", name: "Completed" },
  ];

  const fallbackStages = [
    { id: 47, title: "Design" },
    { id: 48, title: "HTML" },
    { id: 49, title: "Development" },
    { id: 51, title: "QA" },
  ];

  const fallbackPriorities = [
    { id: "1", name: "Low" },
    { id: "2", name: "Medium" },
    { id: "3", name: "High" },
  ];

  // Real team members from API response
  const fallbackTeamMembers = [
    {
      id: 133,
      first_name: "sdSREELAKSHMI",
      last_name: "sd",
      email: "sdsreelakshmi@nuox.io",
    },
    {
      id: 14,
      first_name: "Shimna",
      last_name: "Augustine",
      email: "shimna@nuox.io",
    },
    {
      id: 15,
      first_name: "Shalique",
      last_name: "Rahman",
      email: "shalique@nuox.io",
    },
    { id: 16, first_name: "Jismy", last_name: "Joy", email: "jismy@nuox.io" },
    {
      id: 17,
      first_name: "SEERSHA",
      last_name: "SHIJUNIVAS",
      email: "seersha@nuox.io",
    },
    { id: 20, first_name: "Ebin", last_name: "Mathew", email: "ebin@nuox.io" },
    {
      id: 21,
      first_name: "FASEELA",
      last_name: "M P",
      email: "faseela@nuox.io",
    },
    { id: 22, first_name: "Jaseem", last_name: "ali", email: "jaseem@nuox.io" },
    {
      id: 25,
      first_name: "Surabhi",
      last_name: "MT",
      email: "surabhi@nuox.io",
    },
    {
      id: 26,
      first_name: "Shihab",
      last_name: "Va",
      email: "shihab@element8.ae",
    },
    { id: 27, first_name: "Irshad", last_name: "A", email: "irshad@nuox.io" },
    { id: 29, first_name: "FAHAD", last_name: "T", email: "fahad@nuox.io" },
    { id: 31, first_name: "Samad", last_name: "Abdu", email: "samad@nuox.io" },
    {
      id: 34,
      first_name: "Aiswarya",
      last_name: "R",
      email: "aiswarya@nuox.io",
    },
    {
      id: 36,
      first_name: "Ramsna",
      last_name: "Ramesh",
      email: "ramsna@nuox.io",
    },
    { id: 40, first_name: "Aswin", last_name: "Dev", email: "aswin@nuox.io" },
    { id: 42, first_name: "Reach", last_name: "a", email: "reach@nuox.io" },
    {
      id: 43,
      first_name: "Sijith",
      last_name: "Thomas",
      email: "sijith@nuox.io",
    },
    {
      id: 64,
      first_name: "Shameer",
      last_name: "TM",
      email: "shameer@nuox.io",
    },
    { id: 65, first_name: "Anshid", last_name: "NM", email: "anshid@nuox.io" },
    { id: 67, first_name: "Ranya", last_name: "np", email: "ranya@nuox.io" },
    {
      id: 68,
      first_name: "ashiqc",
      last_name: "mohamed",
      email: "ashiqc@nuox.io",
    },
    {
      id: 70,
      first_name: "Ali",
      last_name: "Zafar",
      email: "ali.zafar@element8.ae",
    },
    {
      id: 79,
      first_name: "Anjitha",
      last_name: "KG",
      email: "anjitha@nuox.io",
    },
    {
      id: 80,
      first_name: "Athira",
      last_name: "Pradeep",
      email: "athira@nuox.io",
    },
    {
      id: 85,
      first_name: "Vyshnavi",
      last_name: "Surendran",
      email: "vyshnavi@nuox.io",
    },
    { id: 86, first_name: "APARNA", last_name: "M", email: "aparna@nuox.io" },
    {
      id: 87,
      first_name: "ASWATHI",
      last_name: "UB",
      email: "aswathi@nuox.io",
    },
    {
      id: 98,
      first_name: "Sabarinath",
      last_name: "TV",
      email: "sabarinath@nuox.io",
    },
    {
      id: 112,
      first_name: "sidharth",
      last_name: "r",
      email: "sidharth@nuox.io",
    },
    {
      id: 113,
      first_name: "VishnuVP",
      last_name: "VP",
      email: "vishnuvp@element8me.com",
    },
    {
      id: 114,
      first_name: "Vishnu",
      last_name: "VP",
      email: "vishnuvp@nuox.io",
    },
    {
      id: 121,
      first_name: "HARSHIN",
      last_name: "KK",
      email: "harshin@nuox.io",
    },
  ];

  // Use API data if available, otherwise use fallback
  const availableProjects = projects.length > 0 ? projects : fallbackProjects;
  const availableStatuses = statuses.length > 0 ? statuses : fallbackStatuses;
  const availableStages = stages.length > 0 ? stages : fallbackStages;
  const availablePriorities =
    priorities.length > 0 ? priorities : fallbackPriorities;
  // Use real team members first, then hook team members, then fallback
  const availableTeamMembers =
    realTeamMembers.length > 0
      ? realTeamMembers
      : teamMembers.length > 0
      ? teamMembers
      : fallbackTeamMembers;

  const [formData, setFormData] = useState({
    title: defaultValues?.title || "",
    description: defaultValues?.description || "",
    project: "",
    status: initialStatus || "",
    stage: initialStage || "",
    priority: defaultValues?.priority || "",
    assigned_to: [] as string[],
    due_date: "",
    task_type: "1", // Default task type
    estimated_hours: defaultValues?.estimated_hours || "8", // Default 8 hours
    progress: defaultValues?.progress?.toString() || "0", // Default progress
  });

  const [formErrors, setFormErrors] = useState({
    title: "",
    project: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Set initial status and stage when they change
  useEffect(() => {
    if (initialStatus) {
      setFormData((prev) => ({ ...prev, status: initialStatus }));
    }
    if (initialStage) {
      setFormData((prev) => ({ ...prev, stage: initialStage }));
    }
  }, [initialStatus, initialStage]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (memberId: string, isChecked: boolean) => {
    setFormData((prev) => {
      const currentAssignees = prev.assigned_to;
      if (isChecked) {
        // Add member if not already selected
        if (!currentAssignees.includes(memberId)) {
          return { ...prev, assigned_to: [...currentAssignees, memberId] };
        }
      } else {
        // Remove member if currently selected
        return {
          ...prev,
          assigned_to: currentAssignees.filter((id) => id !== memberId),
        };
      }
      return prev;
    });
  };

  const validateForm = () => {
    const errors = {
      title: "",
      project: "",
    };

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.project) {
      errors.project = "Project is required";
    }

    setFormErrors(errors);
    return !errors.title && !errors.project;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Clean up the data before sending
      const taskData: any = {
        email: userEmail,
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: parseInt(formData.project),
        status: parseInt(formData.status),
        stage: parseInt(formData.stage),
        assigned_to: formData.assigned_to.map((id) => parseInt(id.toString())),
        task_type: parseInt(formData.task_type),
        estimated_hours: parseInt(formData.estimated_hours),
        progress: parseInt(formData.progress) || 0,
      };

      // Only include optional fields if they have values
      if (formData.priority && formData.priority.trim()) {
        taskData.priority = parseInt(formData.priority);
      }

      if (formData.due_date && formData.due_date.trim()) {
        taskData.due_date = formData.due_date;
      }

      console.log("Creating task with cleaned data:", taskData);
      const result = await createTask(taskData);

      if (result) {
        setSubmitSuccess(true);
        // Call the callback to refresh parent component's task list
        if (onTaskCreated) {
          onTaskCreated();
        }
        // Close the form after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setSubmitError("Failed to create task. Please try again.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show loading state for the entire form, just show loading indicators for individual fields
  // if (loading) {
  //   return (
  //     <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto">
  //       <div className="flex justify-between items-center mb-6">
  //         <h2 className="text-xl font-semibold text-gray-800">
  //           Create New Task
  //         </h2>
  //         <button
  //           onClick={onClose}
  //           className="text-gray-500 hover:text-gray-700"
  //         >
  //           <X className="w-5 h-5" />
  //         </button>
  //       </div>
  //       <div className="flex items-center justify-center py-8">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  //         <span className="ml-3 text-gray-600">Loading...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Create New Task</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {submitSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Task created successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.title ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black`}
                placeholder="Enter task title"
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                placeholder="Enter task description"
              ></textarea>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.project ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black`}
              >
                <option value="">Select Project</option>
                {availableProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {formErrors.project && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.project}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="">Select Status</option>
                {availableStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="">Select Stage</option>
                {availableStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="">Select Priority</option>
                {availablePriorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                placeholder="Enter estimated hours"
              />
            </div>

            {/* Progress */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress (%)
              </label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                placeholder="Enter progress percentage"
              />
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                {availableTeamMembers.length > 0 ? (
                  availableTeamMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assigned_to.includes(
                          member.id.toString()
                        )}
                        onChange={(e) =>
                          handleCheckboxChange(
                            member.id.toString(),
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {`${member.first_name} ${member.last_name}`}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No team members available
                  </p>
                )}
              </div>
              {formData.assigned_to.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.assigned_to.length} member(s) selected
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
