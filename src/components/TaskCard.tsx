import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, Employee } from '@/utils/api'
import AvatarGroup from './AvatarGroup'
import { Calendar, MoreHorizontal, X, Palette, Tag } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface TaskCardProps {
  task: Task;
  employees: Employee[];
  onClick?: () => void;
  viewMode?: "status" | "stage";
  isUpdating?: boolean;
  onColorChange?: (taskId: number, color: string) => void;
  onLabelsChange?: (taskId: number, labels: string[]) => void;
}

export default function TaskCard({
  task,
  employees,
  onClick,
  viewMode = "status",
  isUpdating = false,
  onColorChange,
  onLabelsChange,
}: TaskCardProps) {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [localLabels, setLocalLabels] = useState<string[]>(task.tags || []);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync local labels with task tags when task prop changes
  useEffect(() => {
    setLocalLabels(task.tags || []);
  }, [task.tags]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task.id), // Ensure ID is always a string
    data: {
      type: "task",
      task: task,
    },
  });

  // Debug logging for drag setup (only when dragging)
  if (isDragging) {
    console.log("🔄 TaskCard is being dragged:", {
      taskId: task.id,
      taskTitle: task.title,
    });
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Convert API assignees to Employee format for AvatarGroup
  const assignedEmployees = task.assignees
    ? task.assignees.map((assignee) => ({
        id: assignee.id,
        name: assignee.name,
        email: assignee.email,
        avatar: assignee.profile_pic,
        initials: assignee.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        color: `hsl(${assignee.id * 137.508}deg, 70%, 50%)`, // Generate color based on ID
      }))
    : [];

  // Predefined labels based on API priority structure - ordered by priority (highest first)
  const predefinedLabels = [
    {
      name: "Critical",
      color: "bg-red-700",
      textColor: "text-white",
      priority: 5,
    }, // API ID 4 - Critical
    { name: "High", color: "bg-red-500", textColor: "text-white", priority: 4 }, // API ID 3 - High
    {
      name: "Intermediate",
      color: "bg-yellow-500",
      textColor: "text-white",
      priority: 3,
    }, // API ID 2 - Intermediate
    {
      name: "Low",
      color: "bg-green-500",
      textColor: "text-white",
      priority: 2,
    }, // API ID 1 - Low
    {
      name: "Non-billable",
      color: "bg-gray-500",
      textColor: "text-white",
      priority: 1,
    }, // API ID 5 - Non-billable
    // Additional custom labels
    {
      name: "Bug",
      color: "bg-orange-500",
      textColor: "text-white",
      priority: 4,
    },
    {
      name: "Feature",
      color: "bg-blue-500",
      textColor: "text-white",
      priority: 3,
    },
    {
      name: "Review",
      color: "bg-purple-500",
      textColor: "text-white",
      priority: 2,
    },
  ];

  // Get label priority for sorting - use task's API priority
  const getLabelPriority = (tag: string): number => {
    // Handle task priority - check if it's an object with id/value or just a string
    const taskPriority = task.priority;

    if (
      taskPriority &&
      typeof taskPriority === "object" &&
      "value" in taskPriority &&
      "id" in taskPriority
    ) {
      // API priority object format: { id: number, value: string }
      const priorityObj = taskPriority as { id: number; value: string };
      if (tag.toLowerCase() === priorityObj.value.toLowerCase()) {
        // Higher ID = higher priority for API priorities
        return priorityObj.id;
      }
    } else if (typeof taskPriority === "string") {
      // Simple string priority format
      if (tag.toLowerCase() === taskPriority.toLowerCase()) {
        const stringPriorityMapping: Record<string, number> = {
          low: 1,
          medium: 2,
          high: 3,
        };
        return stringPriorityMapping[taskPriority.toLowerCase()] || 2;
      }
    }

    // For predefined labels, use their priority
    const predefinedLabel = predefinedLabels.find(
      (label) => label.name === tag
    );
    if (predefinedLabel) {
      return predefinedLabel.priority;
    }

    // Map common priority values to priority IDs based on actual API structure
    const priorityMapping: Record<string, number> = {
      low: 1, // API ID 1 = Low
      intermediate: 2, // API ID 2 = Intermediate
      medium: 2, // Same as intermediate
      high: 3, // API ID 3 = High
      critical: 4, // API ID 4 = Critical
      "non-billable": 5, // API ID 5 = Non-billable
      // Additional mappings
      urgent: 4, // Same as critical
      must: 4, // High priority
      should: 3, // Medium priority
      could: 2, // Low priority
      bug: 4, // Critical priority
      feature: 3, // High priority
      review: 2, // Medium priority
    };

    const mappedPriority = priorityMapping[tag.toLowerCase()];
    return mappedPriority || 99; // Unknown labels go to the end
  };

  // Sort labels by priority (higher priority ID = higher priority = appears first)
  const getSortedLabels = (labels: string[]): string[] => {
    const sorted = [...labels].sort(
      (a, b) => getLabelPriority(b) - getLabelPriority(a) // Reverse sort for higher priority first
    );

    console.log("🏷️ Label sorting:", {
      taskId: task.id,
      taskPriority: task.priority,
      originalLabels: labels,
      sortedLabels: sorted,
      priorities: labels.map((label) => ({
        label,
        priority: getLabelPriority(label),
      })),
    });

    return sorted;
  };

  const getTagColor = (tag: string) => {
    const predefinedLabel = predefinedLabels.find(
      (label) => label.name === tag
    );
    if (predefinedLabel) {
      return `${predefinedLabel.color} ${predefinedLabel.textColor}`;
    }

    const colors: Record<string, string> = {
      Product: "bg-blue-100 text-blue-800",
      Design: "bg-pink-100 text-pink-800",
      Marketing: "bg-purple-100 text-purple-800",
      Sales: "bg-green-100 text-green-800",
      Research: "bg-indigo-100 text-indigo-800",
      Development: "bg-yellow-100 text-yellow-800",
      Testing: "bg-red-100 text-red-800",
    };
    return colors[tag] || "bg-gray-100 text-gray-800";
  };

  // Available card colors similar to Trello
  const cardColors = [
    { name: "Default", value: "", bg: "bg-white", border: "border-gray-200" },
    {
      name: "Green",
      value: "green",
      bg: "bg-green-100",
      border: "border-green-300",
    },
    {
      name: "Yellow",
      value: "yellow",
      bg: "bg-yellow-100",
      border: "border-yellow-300",
    },
    {
      name: "Orange",
      value: "orange",
      bg: "bg-orange-100",
      border: "border-orange-300",
    },
    { name: "Red", value: "red", bg: "bg-red-100", border: "border-red-300" },
    {
      name: "Purple",
      value: "purple",
      bg: "bg-purple-100",
      border: "border-purple-300",
    },
    {
      name: "Blue",
      value: "blue",
      bg: "bg-blue-100",
      border: "border-blue-300",
    },
    { name: "Sky", value: "sky", bg: "bg-sky-100", border: "border-sky-300" },
    {
      name: "Pink",
      value: "pink",
      bg: "bg-pink-100",
      border: "border-pink-300",
    },
    {
      name: "Gray",
      value: "gray",
      bg: "bg-gray-100",
      border: "border-gray-300",
    },
  ];

  // Get card background and border classes based on color
  const getCardColorClasses = (color?: string) => {
    if (!color) return "bg-white border-gray-200";
    const colorConfig = cardColors.find((c) => c.value === color);
    return colorConfig
      ? `${colorConfig.bg} ${colorConfig.border}`
      : "bg-white border-gray-200";
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    if (onColorChange) {
      onColorChange(task.id, color);
    }
    setShowColorPicker(false);
    setShowMoreMenu(false);
  };

  // Handle label toggle
  const handleLabelToggle = (labelName: string) => {
    if (!onLabelsChange) return;

    const currentLabels = localLabels;
    const isLabelSelected = currentLabels.includes(labelName);

    let newLabels;
    if (isLabelSelected) {
      newLabels = currentLabels.filter((label) => label !== labelName);
    } else {
      newLabels = [...currentLabels, labelName];
    }

    console.log("🏷️ Label toggle:", {
      taskId: task.id,
      labelName,
      currentLabels,
      isLabelSelected,
      newLabels,
    });

    // Update local state immediately for instant UI feedback
    setLocalLabels(newLabels);

    // Update parent state
    onLabelsChange(task.id, newLabels);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
        setShowColorPicker(false);
        setShowLabelPicker(false);
      }
    };

    if (showMoreMenu || showColorPicker || showLabelPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMoreMenu, showColorPicker, showLabelPicker]);

  // Helper function to clean HTML content from CKEditor
  const cleanHtmlContent = (htmlContent: string) => {
    // Create a temporary div to decode HTML entities
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    // Get text content which automatically decodes HTML entities
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    return textContent.trim();
  };

  // Helper function to check if description needs truncation
  const shouldShowMore = (description: string) => {
    const cleanText = cleanHtmlContent(description);
    return cleanText.length > 25; // Show "More" if description is longer than 25 characters
  };

  // Helper function to get truncated description
  const getTruncatedDescription = (description: string) => {
    const cleanText = cleanHtmlContent(description);
    if (cleanText.length <= 25) return cleanText;
    return cleanText.substring(0, 25) + "...";
  };

  // Helper functions to get values from API objects

  const getStageValue = (stage: any) => {
    return typeof stage === "object" && stage?.value
      ? stage.value
      : typeof stage === "string"
      ? stage
      : "";
  };

  const getStatusValue = (status: any) => {
    return typeof status === "object" && status?.value
      ? status.value
      : typeof status === "string"
      ? status
      : "";
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        ${getCardColorClasses(
          (task as any).color
        )} shadow-sm border p-3 cursor-grab active:cursor-grabbing
        hover:shadow-md transition-all duration-200 group relative
        ${isDragging ? "opacity-50 rotate-3 scale-105" : ""}
        ${
          isUpdating
            ? "opacity-75 animate-pulse border-blue-300 bg-blue-50"
            : ""
        }
      `}
      style={{
        ...style,
        touchAction: "none", // Important for mobile drag
      }}
      onClick={(e) => {
        // Don't trigger card click if description modal is open or if clicking on More button
        if (
          showDescriptionModal ||
          (e.target as HTMLElement).closest("button")
        ) {
          return;
        }
        onClick?.();
      }}
      onMouseDown={(e) => {
        console.log("🖱️ Mouse down on task:", task.title);
      }}
    >
      {/* Labels - Color bars without text at the very top - sorted by priority */}
      {localLabels && localLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {getSortedLabels(localLabels).map((tag, index) => (
            <span
              key={index}
              className={`w-8 h-2 rounded-full ${
                getTagColor(tag).split(" ")[0]
              }`}
              title={tag} // Show label name on hover
            ></span>
          ))}
        </div>
      )}

      {/* Header with Title and Menu */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-xs leading-tight flex-1 pr-2">
          {task.title}
        </h3>
        <div className="relative" ref={menuRef}>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMoreMenu(!showMoreMenu);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreHorizontal className="w-3 h-3 text-gray-400" />
          </button>

          {/* More Menu */}
          {showMoreMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
              <div className="py-1">
                <button
                  className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Palette className="w-3 h-3 mr-2" />
                  Change color
                </button>
                <button
                  className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLabelPicker(!showLabelPicker);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Tag className="w-3 h-3 mr-2" />
                  Edit labels
                </button>
              </div>
            </div>
          )}

          {/* Color Picker */}
          {showColorPicker && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
              <div className="grid grid-cols-5 gap-2">
                {cardColors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${color.bg} ${color.border}`}
                    title={color.name}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColorChange(color.value);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {(task as any).color === color.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <button
                  className="text-xs text-gray-600 hover:text-gray-800"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorChange("");
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Remove color
                </button>
              </div>
            </div>
          )}

          {/* Label Picker */}
          {showLabelPicker && (
            <div
              className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 w-64"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Labels
                </h3>
                <div className="space-y-1">
                  {predefinedLabels
                    .sort((a, b) => a.priority - b.priority) // Sort by priority (lowest number = highest priority)
                    .map((label) => {
                      const isSelected = localLabels.includes(label.name);
                      console.log("🔍 Label check:", {
                        taskId: task.id,
                        labelName: label.name,
                        taskTags: task.tags,
                        localLabels,
                        isSelected,
                      });
                      return (
                        <div
                          key={label.name}
                          className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`label-${task.id}-${label.name}`}
                            checked={isSelected}
                            onChange={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLabelToggle(label.name);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`label-${task.id}-${label.name}`}
                            className={`flex-1 px-2 py-1 rounded text-xs font-medium cursor-pointer ${label.color} ${label.textColor}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLabelToggle(label.name);
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {label.name}
                          </label>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="mb-2">
          <span className="text-xs text-gray-600 truncate block">
            {getTruncatedDescription(task.description)}
            {shouldShowMore(task.description) && (
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  setShowDescriptionModal(true);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
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
          <span className="text-xs font-medium text-gray-700">
            {Math.round(task.time_percentages || 0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-300 bg-blue-500"
            style={{ width: `${Math.min(task.time_percentages || 0, 100)}%` }}
          ></div>
        </div>
      </div>

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
          {viewMode === "stage"
            ? // When viewing by stage, show status
              getStatusValue(task.status) && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getStatusValue(task.status).trim()}
                </span>
              )
            : // When viewing by status, show stage
              getStageValue(task.stage) && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {getStageValue(task.stage).trim()}
                </span>
              )}
        </div>

        {/* Assignees - right aligned */}
        <div>
          {assignedEmployees.length > 0 && (
            <AvatarGroup
              employees={assignedEmployees}
              maxVisible={3}
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Description Modal */}
      {showDescriptionModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setShowDescriptionModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Task Description
              </h3>
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
  );
}
