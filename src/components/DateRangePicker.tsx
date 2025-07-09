'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
  className?: string
}

// Helper function to get current quarter date range
const getCurrentQuarterRange = (): DateRange => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-based

  // Determine current quarter
  const quarter = Math.floor(currentMonth / 3) + 1

  let startMonth: number
  let endMonth: number

  switch (quarter) {
    case 1: // Q1: Jan-Mar
      startMonth = 0
      endMonth = 2
      break
    case 2: // Q2: Apr-Jun
      startMonth = 3
      endMonth = 5
      break
    case 3: // Q3: Jul-Sep
      startMonth = 6
      endMonth = 8
      break
    case 4: // Q4: Oct-Dec
      startMonth = 9
      endMonth = 11
      break
    default:
      startMonth = 0
      endMonth = 2
  }

  const startDate = new Date(currentYear, startMonth, 1)
  const endDate = new Date(currentYear, endMonth + 1, 0) // Last day of the month

  return { startDate, endDate }
}

export default function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range...",
  className = ""
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tempRange, setTempRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [selectingStart, setSelectingStart] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize with current quarter if no value is provided
  useEffect(() => {
    if (!value.startDate && !value.endDate) {
      const quarterRange = getCurrentQuarterRange()
      setTempRange(quarterRange)
      onChange(quarterRange)
    } else {
      setTempRange(value)
    }
  }, [value, onChange])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setTempRange({ startDate: null, endDate: null })
        setSelectingStart(true)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Initialize temp range when opening
  useEffect(() => {
    if (isOpen) {
      setTempRange(value)
      setSelectingStart(!value.startDate)
    }
  }, [isOpen, value])

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDisplayText = () => {
    if (value.startDate && value.endDate) {
      return `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`
    } else if (value.startDate) {
      return `${formatDate(value.startDate)} - Select end date`
    }
    return placeholder
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getNextMonth = (date: Date) => {
    const nextMonth = new Date(date)
    nextMonth.setMonth(date.getMonth() + 1)
    return nextMonth
  }

  const handleDateClick = (day: number, monthOffset = 0) => {
    const targetMonth = new Date(currentMonth)
    targetMonth.setMonth(currentMonth.getMonth() + monthOffset)
    const selectedDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day)

    if (selectingStart || !tempRange.startDate) {
      setTempRange({ startDate: selectedDate, endDate: null })
      setSelectingStart(false)
    } else {
      if (selectedDate < tempRange.startDate) {
        setTempRange({ startDate: selectedDate, endDate: tempRange.startDate })
      } else {
        setTempRange({ startDate: tempRange.startDate, endDate: selectedDate })
      }
    }
  }

  const isDateInRange = (day: number, monthOffset = 0) => {
    if (!tempRange.startDate || !tempRange.endDate) return false
    const targetMonth = new Date(currentMonth)
    targetMonth.setMonth(currentMonth.getMonth() + monthOffset)
    const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day)
    return date >= tempRange.startDate && date <= tempRange.endDate
  }

  const isDateSelected = (day: number, monthOffset = 0) => {
    const targetMonth = new Date(currentMonth)
    targetMonth.setMonth(currentMonth.getMonth() + monthOffset)
    const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day)
    return (tempRange.startDate && date.getTime() === tempRange.startDate.getTime()) ||
           (tempRange.endDate && date.getTime() === tempRange.endDate.getTime())
  }

  const handleApply = () => {
    onChange(tempRange)
    setIsOpen(false)
    setSelectingStart(true)
  }

  const handleCancel = () => {
    setTempRange({ startDate: null, endDate: null })
    setIsOpen(false)
    setSelectingStart(true)
  }

  const clearSelection = () => {
    setTempRange({ startDate: null, endDate: null })
    onChange({ startDate: null, endDate: null })
    setSelectingStart(true)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const renderCalendar = (monthOffset = 0) => {
    const targetMonth = new Date(currentMonth)
    targetMonth.setMonth(currentMonth.getMonth() + monthOffset)

    const daysInMonth = getDaysInMonth(targetMonth)
    const firstDay = getFirstDayOfMonth(targetMonth)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-7 h-7"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day, monthOffset)
      const isInRange = isDateInRange(day, monthOffset)

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day, monthOffset)}
          className={`
            w-7 h-7 text-xs rounded flex items-center justify-center transition-colors
            ${isSelected
              ? 'bg-blue-600 text-white'
              : isInRange
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100 text-gray-700'
            }
          `}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors w-full min-w-[200px]"
      >
        <Calendar className="w-4 h-4" />
        <span className="flex-1 text-left truncate">{getDisplayText()}</span>
        {(value.startDate || value.endDate) && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              clearSelection()
            }}
            className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
          >
            <X className="w-3 h-3" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 min-w-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-900">Date Range</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium px-3 py-1.5 bg-gray-100 rounded">
                Select date range
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dual Calendar Layout */}
          <div className="flex space-x-6">
            {/* Left Month */}
            <div className="flex-1">
              <div className="text-center mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="w-7 h-6 text-xs font-medium text-gray-500 flex items-center justify-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar(0)}
              </div>
            </div>

            {/* Right Month */}
            <div className="flex-1">
              <div className="text-center mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  {getNextMonth(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="w-7 h-6 text-xs font-medium text-gray-500 flex items-center justify-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar(1)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-4 pt-3 border-t">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!tempRange.startDate || !tempRange.endDate}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
