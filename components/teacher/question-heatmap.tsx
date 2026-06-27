'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuestionHeatmapProps {
  totalQuestions: number
  answeredQuestions?: number
  violations?: number[]
  currentQuestion?: number
}

export function QuestionHeatmap({ 
  totalQuestions, 
  answeredQuestions = 0, 
  violations = [], 
  currentQuestion = 0 
}: QuestionHeatmapProps) {
  const data = Array.from({ length: totalQuestions }, (_, i) => {
    const qNum = i + 1
    const violationCount = violations.filter(v => v === qNum).length
    const isAnswered = qNum <= answeredQuestions
    const isCurrent = qNum === currentQuestion + 1
    const hasViolation = violationCount > 0
    
    return { q: qNum, isAnswered, isCurrent, violationCount, hasViolation }
  })
  
  const getColor = (item: typeof data[0]) => {
    if (item.hasViolation) {
      if (item.violationCount >= 2) return 'bg-red-500/60 border-red-400/50'
      return 'bg-amber-500/50 border-amber-400/50'
    }
    if (item.isCurrent) return 'bg-blue-500/50 border-blue-400/50'
    if (item.isAnswered) return 'bg-emerald-500/40 border-emerald-400/50'
    return 'bg-white/10 border-white/20'
  }

  return (
    <div className="grid grid-cols-10 gap-2">
      {data.map((item, idx) => (
        <motion.div
          key={item.q}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.03 }}
          whileHover={{ scale: 1.1, y: -2 }}
          className={cn(
            'relative aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold',
            'border transition-all duration-200',
            'shadow-sm hover:shadow-lg cursor-pointer',
            getColor(item)
          )}
        >
          Q{item.q}
          {item.hasViolation && (
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          {item.isCurrent && (
            <div className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-pulse" />
          )}
        </motion.div>
      ))}
    </div>
  )
}