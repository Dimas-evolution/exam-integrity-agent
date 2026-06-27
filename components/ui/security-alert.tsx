'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ShieldOff, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  type: 'warning' | 'critical' | 'violation'
  title: string
  message: string
  details?: string
}

const typeConfig = {
  warning: { color: 'from-amber-400 to-amber-500', icon: AlertTriangle, glow: 'rgba(245,158,11,0.3)' },
  critical: { color: 'from-red-500 to-red-600', icon: ShieldOff, glow: 'rgba(239,68,68,0.4)' },
  violation: { color: 'from-red-600 to-red-700', icon: AlertTriangle, glow: 'rgba(239,68,68,0.5)' },
}

export function SecurityAlert({ isOpen, onClose, type, title, message, details }: Props) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Alert Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative glass-card rounded-3xl p-8 max-w-md w-full text-center"
            style={{ boxShadow: `0 25px 50px -12px ${config.glow}` }}
          >
            {/* Close button */}
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-2 transition-colors">
              <X className="w-5 h-5 text-pewter" />
            </button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}
              style={{ boxShadow: `0 10px 40px -10px ${config.glow}` }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold text-carbon mb-3"
            >
              {title}
            </motion.h3>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-pewter mb-4"
            >
              {message}
            </motion.p>

            {/* Details */}
            {details && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-xl bg-surface-2 text-sm text-graphite"
              >
                {details}
              </motion.div>
            )}

            {/* Warning indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex items-center justify-center gap-2 text-sm text-pewter"
            >
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span>This incident has been logged</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}