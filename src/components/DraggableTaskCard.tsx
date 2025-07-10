import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  id: number;
  title: string;
  description: string;
  project: {
    id: number;
    value: string;
  };
  stage: {
    id: number;
    value: string;
  };
  status: {
    id: number;
    value: string;
  };
  priority: {
    id: number;
    value: string;
  };
}

interface DraggableTaskCardProps {
  task: Task;
  color: string;
  isUpdating?: boolean;
}

export default function DraggableTaskCard({
  task,
  color,
  isUpdating = false,
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      yellow: "bg-yellow-50 border-yellow-200",
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      pink: "bg-pink-50 border-pink-200",
      orange: "bg-orange-50 border-orange-200",
      purple: "bg-purple-50 border-purple-200",
      indigo: "bg-indigo-50 border-indigo-200",
    };
    return (
      colorMap[color as keyof typeof colorMap] || "bg-gray-50 border-gray-200"
    );
  };

  const getBadgeClasses = (color: string) => {
    const badgeMap = {
      yellow: "bg-yellow-100 text-yellow-800",
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      pink: "bg-pink-100 text-pink-800",
      orange: "bg-orange-100 text-orange-800",
      purple: "bg-purple-100 text-purple-800",
      indigo: "bg-indigo-100 text-indigo-800",
    };
    return (
      badgeMap[color as keyof typeof badgeMap] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-task-id={task.id}
      className={`
        relative p-3 border rounded-md cursor-grab active:cursor-grabbing
        hover:shadow-md transition-all duration-200
        ${getColorClasses(color)}
        ${isDragging ? "opacity-50 rotate-1 scale-105" : ""}
        ${isUpdating ? "opacity-75 animate-pulse cursor-wait" : ""}
      `}
    >
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span className="text-xs text-indigo-600 font-medium">
              Updating...
            </span>
          </div>
        </div>
      )}
      <h3 className="font-medium text-gray-900">{task.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{task.project.value}</p>
      <div className="flex justify-between items-center mt-2">
        <span className={`text-xs px-2 py-1 rounded ${getBadgeClasses(color)}`}>
          {task.stage.value.trim()}
        </span>
        <span className="text-xs text-gray-500">{task.priority.value}</span>
      </div>
    </div>
  );
}
