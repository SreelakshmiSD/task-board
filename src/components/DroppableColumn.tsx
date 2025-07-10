import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableTaskCard from "./DraggableTaskCard";

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

interface DroppableColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  isUpdating?: number | null;
}

export default function DroppableColumn({
  id,
  title,
  tasks,
  color,
  isUpdating,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getHeaderColorClasses = (color: string) => {
    const colorMap = {
      yellow: "border-t-yellow-400",
      blue: "border-t-blue-500",
      green: "border-t-green-500",
      pink: "border-t-pink-500",
      orange: "border-t-orange-500",
      purple: "border-t-purple-500",
      indigo: "border-t-indigo-500",
    };
    return colorMap[color as keyof typeof colorMap] || "border-t-gray-400";
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-white rounded-lg shadow p-6 min-h-96
        transition-colors duration-200
        ${isOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""}
      `}
    >
      {/* Column Header */}
      <div
        className={`pb-4 border-t-4 ${getHeaderColorClasses(
          color
        )} -mx-6 -mt-6 px-6 pt-6 mb-4 bg-white rounded-t-lg`}
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {title} ({tasks.length})
        </h2>
      </div>

      {/* Column Content */}
      <div className="space-y-3">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              color={color}
              isUpdating={isUpdating === task.id}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs">Drag tasks here</p>
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
    </div>
  );
}
