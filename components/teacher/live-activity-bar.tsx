'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LiveAlert {
  id: string
  studentName: string
  type: 'exam_started' | 'question_answered' | 'violation' | 'exam_submitted'
  message: string
  questionNumber?: number
  duration?: number
  timestamp: Date
}

interface LiveActivityBarProps {
  alerts: LiveAlert[]
  onDismiss?: (id: string) => void
}

const eventConfig = {
  exam_started: {
    icon: '🟢',
    color: 'emerald',
    bg: 'bg-emerald-500/20 border-emerald-500/30',
    textColor: 'text-emerald-400',
  },
  question_answered: {
    icon: '✅',
    color: 'blue',
    bg: 'bg-blue-500/20 border-blue-500/30',
    textColor: 'text-blue-400',
  },
  violation: {
    icon: '⚠️',
    color: 'red',
    bg: 'bg-red-500/20 border-red-500/30',
    textColor: 'text-red-400',
  },
  exam_submitted: {
    icon: '📝',
    color: 'purple',
    bg: 'bg-purple-500/20 border-purple-500/30',
    textColor: 'text-purple-400',
  },
}

export function LiveActivityBar({ alerts, onDismiss }: LiveActivityBarProps) {
  const latestAlert = alerts[0]

  React.useEffect(() => {
    if (latestAlert && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss(latestAlert.id)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [latestAlert, onDismiss])

  if (!latestAlert) return null

  const config = eventConfig[latestAlert.type]

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={latestAlert.id}
          initial={{ opacity: 0, y: -100, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -50, height: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn(
            'rounded-xl border p-4 mb-6',
            'bg-gradient-to-r backdrop-blur-xl',
            config.bg
          )}
        >
          <div className="flex items-center gap-4">
            {/* Animated pulse indicator */}
            <motion.div
              className="relative flex-shrink-0"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={cn(
                'w-3 h-3 rounded-full',
                config.color === 'emerald' ? 'bg-emerald-400' :
                config.color === 'blue' ? 'bg-blue-400' :
                config.color === 'red' ? 'bg-red-400' :
                'bg-purple-400'
              )} />
              <div className={cn(
                'absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-75',
                config.color === 'emerald' ? 'bg-emerald-400' :
                config.color === 'blue' ? 'bg-blue-400' :
                config.color === 'red' ? 'bg-red-400' :
                'bg-purple-400'
              )} />
            </motion.div>

            {/* Event icon */}
            <span className="text-2xl flex-shrink-0">{config.icon}</span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs text-white/50">
                  {latestAlert.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span className={cn('font-semibold', config.textColor)}>
                  {latestAlert.studentName}
                </span>
                {latestAlert.questionNumber && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/80">
                    Question {latestAlert.questionNumber}
                  </span>
                )}
                {latestAlert.duration && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/80">
                    {latestAlert.duration}s
                  </span>
                )}
              </div>
              <p className="text-sm text-white/80 mt-1">{latestAlert.message}</p>
            </div>

            {/* Dismiss button */}
            {onDismiss && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDismiss(latestAlert.id)}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}