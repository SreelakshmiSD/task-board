import { useState, useEffect } from 'react'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface ApiStatusNotificationProps {
  message?: string
  type?: 'info' | 'warning' | 'error' | 'success'
  autoHide?: boolean
  duration?: number
  onClose?: () => void
}

export default function ApiStatusNotification({
  message,
  type = 'info',
  autoHide = true,
  duration = 5000,
  onClose
}: ApiStatusNotificationProps) {
  const [isVisible, setIsVisible] = useState(!!message)

  useEffect(() => {
    setIsVisible(!!message)
  }, [message])

  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoHide, duration, onClose])

  if (!isVisible || !message) return null

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'error':
        return <AlertTriangle className="w-5 h-5" />
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 border rounded-lg shadow-lg z-50 ${getStyles()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
