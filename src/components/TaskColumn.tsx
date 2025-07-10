import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, Employee } from '@/utils/api'
import TaskCard from './TaskCard'
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

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
  // Initialize state from localStorage or default to false
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`column-collapsed-${id}`)
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  // Save to localStorage whenever isCollapsed changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`column-collapsed-${id}`, JSON.stringify(isCollapsed))
    }
  }, [isCollapsed, id])

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
        flex flex-col bg-gray-50 rounded-lg h-full
        transition-all duration-300 ease-in-out
        ${isCollapsed
          ? 'min-w-16 max-w-16 w-16'
          : 'min-w-80 max-w-80 sm:min-w-72 sm:max-w-72 md:min-w-80 md:max-w-80'
        }
        ${isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}
      `}
    >
      {/* Column Header */}
      <div className={`border-t-4 ${getColumnColor(id)} bg-white rounded-t-lg ${isCollapsed ? 'p-2' : 'p-4'}`}>
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
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
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
                onClick={onAddTask}
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
      )}
    </div>
  )
}
