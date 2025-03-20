import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type, duration = 1000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 페이드 아웃 애니메이션이 끝난 후 제거
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
        'px-6 py-3 rounded-lg shadow-lg',
        'transition-all duration-300',
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}
    >
      {message}
    </div>
  )
} 