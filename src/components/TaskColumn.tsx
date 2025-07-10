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

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  employees: Employee[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: () => void;
  onTaskCreated?: () => void; // Callback to refresh task list after creation
  viewMode?: "status" | "stage";
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
  });

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
    return stageVariantMap[columnId] || "default";
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
      pending: "1", // Low
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

    return {
      title: defaultTitleMap[columnId] || `New ${columnTitle} Task`,
      description: `Task created for ${columnTitle} column`,
      priority: defaultPriorityMap[columnId] || "2",
      estimated_hours: defaultEstimatedHours[columnId] || "8",
      progress: 0, // Always start with 0% for quick creation
    };
  };

  // Quick task creation function
  const handleQuickTaskCreate = async (taskTitle: string) => {
    if (!userEmail) {
      console.error("No user email available");
      return;
    }

    try {
      const defaultValues = getDefaultValues(id, title);

      // Get the first available project (you can modify this logic)
      const defaultProject = "319"; // HR Portal E8 - you can make this dynamic

      // Map column ID to correct stage ID based on your API
      const getStageId = (columnId: string, viewMode: string): number => {
        if (viewMode === "stage") {
          // If we're in stage view, use the column ID directly
          const stageIdMap: { [key: string]: number } = {
            "47": 47, // Design
            "48": 48, // HTML
            "49": 49, // Development
            "51": 51, // QA
            "46": 46, // Discovery
            // Fallback for string-based IDs
            design: 47,
            html: 48,
            development: 49,
            qa: 51,
            discovery: 46,
          };
          return stageIdMap[columnId] || 47;
        }
        // Default stage for status-based view
        return 49; // Default to Development
      };

      const stageId = getStageId(id, viewMode);

      // Prepare data in the exact format the API expects
      const apiData = {
        task_type: 1,
        project: parseInt(defaultProject),
        stage: stageId,
        title: taskTitle,
        estimated_hours: parseInt(defaultValues.estimated_hours),
        priority: parseInt(defaultValues.priority),
        status: 1, // Always set to intermediate status (1 = pending, 2 = ongoing, 3 = completed)
        description: defaultValues.description || "none",
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

      const result = await response.json();
      console.log("Quick task creation result:", result);

      if (result.status === "success" || result.result === "success") {
        setShowInlineCreator(false);
        if (onTaskCreated) {
          onTaskCreated();
        }
      } else {
        console.error("Failed to create task:", result.message);
      }
    } catch (error) {
      console.error("Error creating quick task:", error);
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
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                employees={employees}
                onClick={() => onTaskClick?.(task)}
                viewMode={viewMode}
              />
            ))}
          </SortableContext>

          {/* Task Info Card - shown when there are tasks */}
          {tasks.length > 0 && !showInlineCreator && (
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

          {tasks.length === 0 && !isOver && !showInlineCreator && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs">Drag tasks here or click + to add</p>
              <button
                onClick={() => setShowInlineCreator(true)}
                className="mt-3 px-3 py-1.5 text-sm font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                + Add a card
              </button>
            </div>
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
