'use client'

import { motion } from 'framer-motion'
import type { Database } from '@/types/supabase'
type CheatingEvent = Database['public']['Tables']['cheating_events']['Row']

interface Props { events: CheatingEvent[] }

const eventConfig: Record<string, { icon: string; color: string; bg: string }> = {
  tab_switch: { icon: '⇄', color: 'text-info', bg: 'bg-info/10' },
  mouse_leave: { icon: '↗', color: 'text-warning', bg: 'bg-warning/10' },
  copy_attempt: { icon: '⎘', color: 'text-danger', bg: 'bg-danger/10' },
  paste_attempt: { icon: '⎘', color: 'text-danger', bg: 'bg-danger/10' },
  window_blur: { icon: '◐', color: 'text-purple-500', bg: 'bg-purple-500/10' },
}

export function ActivityTimeline({ events }: Props) {
  const sorted = [...events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8)
  
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <h3 className="text-[14px] font-semibold text-carbon">Recent Activity</h3>
      <div className="space-y-2">
        {sorted.map((event, idx) => {
          const config = eventConfig[event.event_type] || { icon: '•', color: 'text-pewter', bg: 'bg-surface' }
          return (
            <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-surface-2/50 hover:bg-surface-2 transition-colors"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] ${config.bg} ${config.color}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-carbon capitalize">{event.event_type.replace('_', ' ')}</p>
                <p className="text-[11px] text-pewter">Question {event.question_number}</p>
              </div>
              <span className="text-[10px] text-pewter">{new Date(event.created_at).toLocaleTimeString()}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}