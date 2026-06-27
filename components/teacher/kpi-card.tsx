'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'green' | 'amber' | 'red' | 'blue' | 'purple'
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  delay?: number
}

const colorSchemes = {
  green: {
    bg: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/30 hover:border-emerald-400/50',
    icon: 'bg-emerald-500/20 text-emerald-400',
    glow: 'shadow-emerald-500/20',
    value: 'text-emerald-400',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/30 hover:border-amber-400/50',
    icon: 'bg-amber-500/20 text-amber-400',
    glow: 'shadow-amber-500/20',
    value: 'text-amber-400',
  },
  red: {
    bg: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30 hover:border-red-400/50',
    icon: 'bg-red-500/20 text-red-400',
    glow: 'shadow-red-500/20',
    value: 'text-red-400',
  },
  blue: {
    bg: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30 hover:border-blue-400/50',
    icon: 'bg-blue-500/20 text-blue-400',
    glow: 'shadow-blue-500/20',
    value: 'text-blue-400',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30 hover:border-purple-400/50',
    icon: 'bg-purple-500/20 text-purple-400',
    glow: 'shadow-purple-500/20',
    value: 'text-purple-400',
  },
}

export function KpiCard({ title, value, icon, color, subtitle, trend, delay = 0 }: KpiCardProps) {
  const [displayValue, setDisplayValue] = React.useState(0)
  const scheme = colorSchemes[color]

  React.useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br backdrop-blur-xl',
        'border transition-all duration-300',
        scheme.bg,
        scheme.border
      )}
    >
      {/* Glow effect */}
      <div className={cn('absolute inset-0 blur-xl opacity-30', scheme.glow)} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/60">{title}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <motion.span 
                className={cn('text-4xl font-bold tabular-nums', scheme.value)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={displayValue}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="inline-block"
                  >
                    {displayValue}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
              {trend && (
                <span className={cn(
                  'text-xs font-medium',
                  trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'
                )}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-white/40 mt-1">{subtitle}</p>
            )}
          </div>
          <motion.div 
            className={cn('p-3 rounded-xl', scheme.icon)}
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            {icon}
          </motion.div>
        </div>
      </div>

      {/* Animated border gradient */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50',
        color === 'green' ? 'from-emerald-500 to-emerald-300' :
        color === 'amber' ? 'from-amber-500 to-amber-300' :
        color === 'red' ? 'from-red-500 to-red-300' :
        color === 'blue' ? 'from-blue-500 to-blue-300' :
        'from-purple-500 to-purple-300'
      )} />
    </motion.div>
  )
}