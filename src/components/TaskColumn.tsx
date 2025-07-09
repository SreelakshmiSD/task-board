import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, Employee } from '@/utils/api'
import TaskCard from './TaskCard'
import { Plus } from 'lucide-react'

interface TaskColumnProps {
  id: string
  title: string
  tasks: Task[]
  employees: Employee[]
  onTaskClick?: (task: Task) => void
  onAddTask?: () => void
  viewMode?: 'status' | 'stage'
}

export default function TaskColumn({
  id,
  title,
  tasks,
  employees,
  onTaskClick,
  onAddTask,
  viewMode = 'status'
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const getColumnColor = (columnId: string) => {
    const colors: Record<string, string> = {
      'pending': 'border-t-gray-400',
      'ongoing': 'border-t-blue-500',
      'completed': 'border-t-green-500',
      'design': 'border-t-pink-500',
      'html': 'border-t-orange-500',
      'development': 'border-t-purple-500',
      'qa': 'border-t-indigo-500',
    }
    return colors[columnId] || 'border-t-gray-400'
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col min-w-80 max-w-80 sm:min-w-72 sm:max-w-72 md:min-w-80 md:max-w-80 bg-gray-50 rounded-lg h-full
        transition-colors duration-200
        ${isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}
      `}
    >
      {/* Column Header */}
      <div className={`p-4 border-t-4 ${getColumnColor(id)} bg-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {tasks.length}
            </span>
            <button
              onClick={onAddTask}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Add new task"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
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

        {tasks.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs">Drag tasks here or click + to add</p>
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
  )
}
