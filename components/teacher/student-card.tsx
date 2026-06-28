'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type Exam = Database['public']['Tables']['exams']['Row']
type Session = Database['public']['Tables']['exam_sessions']['Row']
type CheatingEvent = Database['public']['Tables']['cheating_events']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type StudentAnswer = Database['public']['Tables']['student_answers']['Row']

type SessionWithDetails = Session & {
  exams: Pick<Exam, 'id' | 'title' | 'description'>
  profiles: Pick<Profile, 'id' | 'name'>
  cheating_events: CheatingEvent[]
  student_answers: StudentAnswer[]
  score?: number | null
}

interface StudentCardProps {
  session: SessionWithDetails & {
    exam_title: string
    student_name: string
    student_email?: string
    exam_description?: string
    duration_minutes?: number
  }
}

const VIOLATION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  tab_switch: { label: 'Tab Switch', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  copy_paste: { label: 'Copy Paste', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  mouse_leave: { label: 'Mouse Leave', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  visibility_hidden: { label: 'Visibility Hidden', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
}

const RISK_LEVELS = [
  { max: 20, label: 'SAFE', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  { max: 50, label: 'WARNING', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  { max: 75, label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  { max: 100, label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
]

function calculateRiskScore(events: CheatingEvent[]) {
  let score = 0
  events.forEach((ce: CheatingEvent) => {
    switch (ce.event_type) {
      case 'copy_paste': score += 30; break
      case 'tab_switch': score += 15; break
      case 'mouse_leave': score += 10; break
      case 'visibility_hidden': score += 25; break
    }
  })
  const clampedScore = Math.min(100, score)
  const level = RISK_LEVELS.find(r => clampedScore <= r.max) || RISK_LEVELS[RISK_LEVELS.length - 1]
  return { score: clampedScore, level }
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-- --- ----'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function StudentCard({ session }: StudentCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const isActive = session.status === 'active'
  const { score: riskScore, level: riskLevel } = React.useMemo(() => calculateRiskScore(session.cheating_events), [session.cheating_events])
  const violationCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    session.cheating_events.forEach((ce: CheatingEvent) => { counts[ce.event_type] = (counts[ce.event_type] || 0) + 1 })
    return counts
  }, [session.cheating_events])
  const totalQuestions = 10
  const answeredQuestions = session.student_answers.length
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
  const latestViolation = session.cheating_events.length > 0 ? session.cheating_events[session.cheating_events.length - 1] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-2xl border overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl',
        isActive ? 'border-emerald-500/40' : 'border-white/10',
        riskScore > 50 && 'ring-2 ring-red-500/30'
      )}
    >
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-4">
          <motion.div className="relative flex-shrink-0" animate={isActive ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {session.student_name?.charAt(0).toUpperCase() || '?'}
            </div>
            {isActive && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-800">
                <motion.div className="absolute inset-0 bg-emerald-400 rounded-full opacity-75" animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }} transition={{ duration: 2, repeat: Infinity }} />
              </div>
            )}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base">{session.student_name || 'Unknown Student'}</h3>
            <p className="text-sm text-slate-400 truncate">{session.student_email || 'student@email.com'}</p>
          </div>
          <span className={cn('px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0', isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30')}>
            {session.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Course</p>
            <p className="text-white font-semibold text-sm truncate">{session.exam_title || session.exams?.title || 'Unknown'}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Duration</p>
            <p className="text-white font-semibold text-sm">{session.duration_minutes || 60} min</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Started</p>
            <p className="text-white font-mono text-sm">{formatDate(session.started_at)}</p>
            <p className="text-slate-400 font-mono text-xs">{formatTime(session.started_at)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Submitted</p>
            <p className="text-white font-mono text-sm">{formatDate(session.completed_at)}</p>
            <p className="text-slate-400 font-mono text-xs">{formatTime(session.completed_at)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Progress</span>
            <span className="text-sm font-bold text-white">{answeredQuestions}/{totalQuestions} Questions</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>

        {session.status === 'submitted' && session.score !== undefined && session.score !== null && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-400/5 border border-blue-500/20">
            <span className="text-sm font-medium text-blue-400">Final Score</span>
            <span className="text-xl font-bold text-white">{session.score} / 100</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path className="stroke-slate-700" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <motion.path className={cn('stroke-current', riskLevel.color)} strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray={`${riskScore}, 100`} initial={{ strokeDasharray: '0, 100' }} animate={{ strokeDasharray: `${riskScore}, 100` }} transition={{ duration: 1, ease: 'easeOut' }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <motion.span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{riskScore}</motion.span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Risk Score</p>
              <p className={cn('text-sm font-bold', riskLevel.color)}>{riskLevel.label}</p>
            </div>
          </div>
          <div className="flex-1 flex gap-1">
            <div className="flex-1 h-1 rounded-full bg-emerald-500/50" />
            <div className="flex-1 h-1 rounded-full bg-amber-500/50" />
            <div className="flex-1 h-1 rounded-full bg-orange-500/50" />
            <div className="flex-1 h-1 rounded-full bg-red-500/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(VIOLATION_CONFIG).map(([key, config]) => (
            <div key={key} className={cn('flex items-center justify-between rounded-lg p-2 border', config.bg, config.border)}>
              <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
              <span className={cn('text-sm font-bold', config.color)}>{violationCounts[key] || 0}</span>
            </div>
          ))}
        </div>

        {latestViolation && (
          <div className={cn('rounded-xl p-4 border', VIOLATION_CONFIG[latestViolation.event_type]?.bg, VIOLATION_CONFIG[latestViolation.event_type]?.border)}>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Latest Violation</p>
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', VIOLATION_CONFIG[latestViolation.event_type]?.bg, VIOLATION_CONFIG[latestViolation.event_type]?.border)}>
                <span className={cn('text-lg font-bold', VIOLATION_CONFIG[latestViolation.event_type]?.color)}>
                  {latestViolation.event_type === 'tab_switch' ? 'T' : latestViolation.event_type === 'copy_paste' ? 'C' : latestViolation.event_type === 'mouse_leave' ? 'M' : 'V'}
                </span>
              </div>
              <div className="flex-1">
                <p className={cn('text-sm font-semibold', VIOLATION_CONFIG[latestViolation.event_type]?.color)}>{VIOLATION_CONFIG[latestViolation.event_type]?.label}</p>
                <p className="text-xs text-slate-400">
                  {latestViolation.question_number ? `Question ${latestViolation.question_number}` : 'N/A'}
                  {latestViolation.duration_seconds ? ` - ${latestViolation.duration_seconds}s` : ''}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-mono">{formatTime(latestViolation.created_at)}</p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-slate-400 mb-2">Question Heatmap</p>
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const qNum = i + 1
              const violations = session.cheating_events.filter(ce => ce.question_number === qNum)
              const hasViolation = violations.length > 0
              return (
                <motion.div key={qNum} className={cn('flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-semibold border', hasViolation ? 'bg-red-500/30 text-red-400 border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05, type: 'spring' }} whileHover={{ scale: 1.05 }}>
                  Q{qNum}
                </motion.div>
              )
            })}
          </div>
        </div>

        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-white transition-colors" aria-expanded={isExpanded}>
          <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-5 space-y-4 bg-slate-900/50">
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
                  View Answers
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">
                  View Timeline
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">
                  Download Report
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}