'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success'
  onClose: () => void
}

export function Toast({ message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg border z-50 flex items-center gap-3 animate-slide-in-right ${
      type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-pewter hover:text-carbon transition-colors">
        ✕
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type?: 'error' | 'success' } | null>(null)

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}