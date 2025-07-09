'use client'

import {
  Menu,
  FolderOpen,
  CheckSquare
} from 'lucide-react'

interface SideMenuProps {
  onMenuItemSelect?: (item: 'project' | 'task') => void
  selectedMenuItem?: 'project' | 'task'
}

export default function SideMenu({
  onMenuItemSelect,
  selectedMenuItem = 'project'
}: SideMenuProps) {

  const menuItems = [
    {
      id: 'project' as const,
      icon: FolderOpen,
      label: 'Project'
    },
    {
      id: 'task' as const,
      icon: CheckSquare,
      label: 'Task'
    }
  ]

  const handleMenuItemClick = (itemId: 'project' | 'task') => {
    onMenuItemSelect?.(itemId)
  }

  return (
    <div className="group fixed top-0 left-0 h-full bg-gray-100 border-r border-gray-200 w-16 hover:w-48 z-40 transition-all duration-300 ease-in-out">
      {/* Hamburger Menu Icon at top */}
      <div className="flex items-center pt-4 pb-6 px-4">
        <div className="p-2">
          <Menu className="w-5 h-5 text-gray-600" />
        </div>
        <span className="ml-3 text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Menu
        </span>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col space-y-2 px-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isSelected = selectedMenuItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`
                flex items-center w-full p-3 rounded-lg transition-all duration-200
                ${isSelected
                  ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                  : 'hover:bg-gray-200 text-gray-600'
                }
              `}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
