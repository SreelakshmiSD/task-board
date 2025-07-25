import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, Employee } from '@/utils/api'
import TaskCard from './TaskCard'
import CreateTaskModal from "./CreateTaskModal";
import TaskInfoCard from "./TaskInfoCard";
import InlineCardCreator from "./InlineCardCreator";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ApiTaskAssignee, ApiStage } from '@/lib/services/taskManagementServices';

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  employees: Employee[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: () => void;
  onTaskCreated?: () => void; // Callback to refresh task list after creation
  viewMode?: "status" | "stage";
  updatingTaskId?: number | null; // ID of task currently being updated via drag & drop
  selectedProject?: string; // Currently selected project name
  projects?: Array<{ id: number; name: string }>; // Available projects for ID lookup
  stages?: ApiStage[]; // Available stages for stage ID mapping
  onColorChange?: (taskId: number, color: string) => void;
  onLabelsChange?: (taskId: number, labels: string[]) => void;
  onAssigneesChange?: (taskId: number, assignees: ApiTaskAssignee[]) => void;
}

export default function TaskColumn({
  id,
  title,
  tasks,
  employees,
  onTaskClick,
  onAddTask,
  onTaskCreated,
  viewMode = "status",
  updatingTaskId,
  selectedProject,
  projects = [],
  stages = [],
  onColorChange,
  onLabelsChange,
  onAssigneesChange,
}: TaskColumnProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  // Initialize state from localStorage or default to false
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`column-collapsed-${id}`);
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // State for create task modal
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // State for inline card creator
  const [showInlineCreator, setShowInlineCreator] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      columnId: id,
      title: title,
    },
  });

  // Debug logging for column setup (only when drag over)
  if (isOver) {
    console.log("🎯 Column has drag over:", {
      columnId: id,
      columnTitle: title,
    });
  }

  // Handle add task click
  const handleAddTask = () => {
    if (onAddTask) {
      onAddTask();
    } else {
      // Open our create task modal with the column's status/stage pre-selected
      setIsCreateTaskModalOpen(true);
    }
  };

  // Get card variant based on stage ID and column type
  const getCardVariant = (
    columnId: string
  ): "default" | "blue" | "green" | "purple" => {
    // Stage-based color mapping
    const stageVariantMap: {
      [key: string]: "default" | "blue" | "green" | "purple";
    } = {
      "47": "purple", // Design - Purple
      "48": "default", // HTML - Black/Default
      "49": "green", // Development - Green
      "51": "default", // QA - Black/Default
      "46": "blue", // Discovery - Blue
      // Fallback for string-based IDs
      design: "purple",
      html: "default",
      development: "green",
      qa: "default",
      discovery: "blue",
      pending: "blue",
      ongoing: "green",
      completed: "purple",
    };
    const variant = stageVariantMap[columnId] || "default";
    console.log("🎨 Card variant for column:", { columnId, variant, title });
    return variant;
  };

  // Get default values for new tasks based on column
  const getDefaultValues = (columnId: string, columnTitle: string) => {
    const defaultTitleMap: { [key: string]: string } = {
      // Numeric stage IDs
      "47": "Design Task",
      "48": "HTML Task",
      "49": "Development Task",
      "51": "QA Testing Task",
      "46": "Discovery Task",
      // String-based fallbacks
      design: "Design Task",
      html: "HTML/CSS Task",
      development: "Development Task",
      qa: "QA Testing Task",
      discovery: "Discovery Task",
      pending: "New Task",
      ongoing: "In Progress Task",
      completed: "Completed Task",
      // Additional stage mappings
      newproject: "New Project Task",
      cr: "CR Task",
      amc: "AMC Task",
    };

    const defaultPriorityMap: { [key: string]: string } = {
      // Numeric stage IDs
      "47": "1", // Low priority for design
      "48": "2", // Medium priority for HTML
      "49": "3", // High priority for development
      "51": "2", // Medium priority for QA
      "46": "1", // Low priority for discovery
      // String-based fallbacks
      design: "2", // Medium
      html: "2", // Medium
      development: "3", // High
      qa: "3", // High
      discovery: "1", // Low
      pending: "2", // Medium for status-based
      ongoing: "2", // Medium
      completed: "1", // Low
    };

    const defaultEstimatedHours: { [key: string]: string } = {
      // Numeric stage IDs
      "47": "4", // 4 hours for design
      "48": "6", // 6 hours for HTML
      "49": "8", // 8 hours for development
      "51": "3", // 3 hours for QA
      "46": "2", // 2 hours for discovery
      // String-based fallbacks
      design: "4",
      html: "6",
      development: "8",
      qa: "4",
      discovery: "2",
      pending: "8",
      ongoing: "8",
      completed: "8",
    };

    // For status-based creation, use specific defaults as requested
    const isStatusColumn = viewMode === "status";

    return {
      title: defaultTitleMap[columnId] || `New ${columnTitle} Task`,
      description: isStatusColumn
        ? "none"
        : `Task created for ${columnTitle} column`,
      priority: defaultPriorityMap[columnId] || "2",
      estimated_hours: defaultEstimatedHours[columnId] || "8",
      progress: 0, // Always start with 0% for quick creation
      // For status-based creation, always default to stage 49 (Development)
      defaultStage: isStatusColumn ? "49" : undefined,
      // Always use task_type 1 (Project) as requested
      task_type: "1",
    };
  };

  // Quick task creation function
  const handleQuickTaskCreate = async (taskTitle: string) => {
    if (!userEmail) {
      console.error("No user email available");
      return;
    }

    if (!selectedProject) {
      console.error("No project selected");
      return;
    }

    try {
      const defaultValues = getDefaultValues(id, title);

      // Get the selected project ID from the project name
      const selectedProjectData = projects.find(
        (p) => p.name === selectedProject
      );
      if (!selectedProjectData) {
        console.error(
          "Selected project not found in projects list:",
          selectedProject
        );
        return;
      }

      const projectId = selectedProjectData.id.toString();
      console.log(
        "🎯 Using selected project:",
        selectedProject,
        "ID:",
        projectId
      );

      // Map column ID to correct stage ID based on your API
      const getStageId = (columnId: string, viewMode: string): number => {
        console.log(`🎯 getStageId called with columnId: "${columnId}", viewMode: "${viewMode}"`);
        console.log(`🎯 Available stages:`, stages);

        if (viewMode === "stage") {
          // First try to parse as direct numeric ID
          const numericId = parseInt(columnId);
          if (!isNaN(numericId)) {
            console.log(`🎯 Using numeric column ID directly: ${numericId}`);
            return numericId;
          }

          // If we're in stage view, try to find the stage by matching the column title
          // Get all available stages from the context
          const availableStages = stages || [];

          // Try to find a matching stage by converting title to column ID format
          const matchingStage = availableStages.find(stage => {
            const stageColumnId = stage.title.toLowerCase().replace(/\s+/g, "");
            console.log(`🎯 Comparing "${stageColumnId}" with "${columnId}"`);
            return stageColumnId === columnId;
          });

          if (matchingStage) {
            console.log(`🎯 Found matching stage for column "${columnId}":`, matchingStage);
            return matchingStage.id;
          }

          // Fallback to static mapping for known stages
          const stageIdMap: { [key: string]: number } = {
            "47": 47, // Design
            "48": 48, // HTML
            "49": 49, // Development
            "51": 51, // QA
            "46": 46, // Discovery
            // String-based fallbacks
            design: 47,
            html: 48,
            development: 49,
            qa: 51,
            discovery: 46,
            newproject: 47, // Default new project to Design stage
            cr: 49, // Default CR to Development stage
            amc: 49, // Default AMC to Development stage
          };

          const stageId = stageIdMap[columnId] || 47;
          console.log(`🎯 Using fallback stage ID for column "${columnId}": ${stageId}`);
          return stageId;
        }
        // For status-based view, always use stage 49 (Development)
        console.log(`🎯 Status-based view, using stage 49`);
        return 49;
      };

      // Map status column ID to status value
      const getStatusId = (columnId: string, viewMode: string): number => {
        if (viewMode === "status") {
          const statusIdMap: { [key: string]: number } = {
            "1": 1, // Pending
            "2": 2, // On-going
            "3": 3, // Completed
            // String-based fallbacks
            pending: 1,
            ongoing: 2,
            "on-going": 2,
            completed: 3,
          };
          return statusIdMap[columnId] || 1; // Default to Pending
        }
        return 1; // Default status for stage-based view
      };

      const stageId = getStageId(id, viewMode);
      const statusId = getStatusId(id, viewMode);

      // Prepare data in the exact format the API expects for status-based creation
      const apiData = {
        task_type: 1,
        project: parseInt(projectId),
        stage: viewMode === "status" ? 49 : stageId, // Always 49 for status-based
        title: taskTitle,
        estimated_hours:
          viewMode === "status" ? 8 : parseInt(defaultValues.estimated_hours), // Always 8 for status-based
        priority: viewMode === "status" ? 2 : parseInt(defaultValues.priority), // Always 2 for status-based
        status: statusId,
        description:
          viewMode === "status"
            ? taskTitle
            : defaultValues.description || taskTitle, // Use task title as description
        email: userEmail,
      };

      console.log("Creating quick task with API format:", apiData);

      // Call the API directly instead of using the service
      const response = await fetch("/api/create-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Quick task creation result:", result);

      if (result.status === "success" || result.result === "success") {
        console.log("✅ Task created successfully!");
        setShowInlineCreator(false);
        if (onTaskCreated) {
          onTaskCreated();
        }
      } else {
        console.error("❌ Failed to create task:", result.message || result);
        alert("Failed to create task: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error creating quick task:", error);
      alert("Error creating task: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  // Save to localStorage whenever isCollapsed changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `column-collapsed-${id}`,
        JSON.stringify(isCollapsed)
      );
    }
  }, [isCollapsed, id]);

  const getColumnColor = (columnId: string) => {
    const colors: Record<string, string> = {
      pending: "border-t-gray-400",
      ongoing: "border-t-blue-500",
      completed: "border-t-green-500",
      design: "border-t-pink-500",
      html: "border-t-orange-500",
      development: "border-t-purple-500",
      qa: "border-t-indigo-500",
    };
    return colors[columnId] || "border-t-gray-400";
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col bg-gray-50 rounded-lg h-full
        transition-all duration-300 ease-in-out
        ${
          isCollapsed
            ? "min-w-16 max-w-16 w-16"
            : "min-w-80 max-w-80 sm:min-w-72 sm:max-w-72 md:min-w-80 md:max-w-80"
        }
        ${isOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""}
      `}
    >
      {/* Column Header */}
      <div
        className={`border-t-4 ${getColumnColor(id)} bg-white rounded-t-lg ${
          isCollapsed ? "p-2" : "p-4"
        }`}
      >
        {isCollapsed ? (
          // Collapsed Header - Vertical Layout
          <div className="flex flex-col items-center h-full">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 rounded transition-colors mb-2"
              title="Expand column"
            >
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <div
                className="writing-mode-vertical text-sm font-semibold text-gray-900 whitespace-nowrap"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                {title}
              </div>
            </div>
            <div className="mt-2">
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-1 py-1 rounded-full min-w-[20px] text-center block">
                {tasks.length}
              </span>
            </div>
          </div>
        ) : (
          // Expanded Header - Horizontal Layout
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Collapse column"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
              <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                {tasks.length}
              </span>
              <button
                onClick={handleAddTask}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Add new task"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Column Content */}
      {!isCollapsed && (
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          <SortableContext
            items={tasks.map((task) => String(task.id))} // Ensure IDs are strings
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                employees={employees}
                onClick={() => onTaskClick?.(task)}
                viewMode={viewMode}
                isUpdating={updatingTaskId === task.id}
                onColorChange={onColorChange}
                onLabelsChange={onLabelsChange}
                onAssigneesChange={onAssigneesChange}
              />
            ))}
          </SortableContext>

          {/* Task Info Card - show always for debugging */}
          {!showInlineCreator && (
            <TaskInfoCard
              message={`Tasks from Daily Tasks are copied here on a daily basis.`}
              onAddCard={() => setShowInlineCreator(true)}
              showCopyIcon={true}
              variant={getCardVariant(id)}
              buttonText="Add a card"
            />
          )}

          {/* Inline Card Creator */}
          {showInlineCreator && (
            <InlineCardCreator
              onSave={handleQuickTaskCreate}
              onCancel={() => setShowInlineCreator(false)}
              placeholder="Enter a title or paste a link"
              defaultTitle={getDefaultValues(id, title).title}
            />
          )}



          {isOver && (
            <div className="flex items-center justify-center py-4 text-blue-500">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 w-full text-center">
                <p className="text-sm font-medium">Drop task here</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        initialStatus={viewMode === "status" ? id : undefined}
        initialStage={viewMode === "stage" ? id : undefined}
        onTaskCreated={onTaskCreated}
        defaultValues={getDefaultValues(id, title)}
      />
    </div>
  );
}
