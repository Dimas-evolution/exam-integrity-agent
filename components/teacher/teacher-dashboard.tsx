'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { StudentCard } from './student-card'
import { KpiCard } from './kpi-card'
import { LiveActivityBar } from './live-activity-bar'
import { cn } from '@/lib/utils'

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
  exam_title: string
  student_name: string
  student_email?: string
  exam_description?: string
  duration_minutes?: number
}

type FilterType = 'all' | 'active' | 'submitted' | 'high_risk' | 'safe' | 'warning' | 'critical'

function calculateRiskScore(session: SessionWithDetails): number {
  let score = 0
  session.cheating_events.forEach((ce: CheatingEvent) => {
    switch (ce.event_type) {
      case 'copy_paste': score += 30; break
      case 'tab_switch': score += 15; break
      case 'mouse_leave': score += 10; break
      case 'visibility_hidden': score += 25; break
    }
  })
  return Math.min(100, score)
}

export function TeacherDashboard({ sessions: initialSessions }: TeacherDashboardProps) {
  const [sessions, setSessions] = React.useState<SessionWithDetails[]>(initialSessions)
  const [filter, setFilter] = React.useState<FilterType>('all')
  const [search, setSearch] = React.useState('')
  const [liveAlerts, setLiveAlerts] = React.useState<Array<{id: string; studentName: string; type: 'exam_started' | 'question_answered' | 'violation' | 'exam_submitted'; message: string; timestamp: Date}>>([])
  const supabase = createClient()

  const kpis = React.useMemo(() => {
    const totalStudents = new Set(sessions.map(s => s.student_id)).size
    const activeSessions = sessions.filter(s => s.status === 'active').length
    const completedSessions = sessions.filter(s => s.status === 'submitted').length
    const totalViolations = sessions.reduce((acc, s) => acc + s.cheating_events.length, 0)
    const highRiskStudents = sessions.filter(s => calculateRiskScore(s) > 50).length
    const safeCount = sessions.filter(s => calculateRiskScore(s) === 0).length
    const warningCount = sessions.filter(s => { const sc = calculateRiskScore(s); return sc > 0 && sc <= 50; }).length
    const criticalCount = sessions.filter(s => calculateRiskScore(s) > 50).length
    return { totalStudents, activeSessions, completedSessions, totalViolations, highRiskStudents, safeCount, warningCount, criticalCount }
  }, [sessions])

  React.useEffect(() => {
    const channel = supabase.channel('teacher-monitoring')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cheating_events' }, (payload) => {
        const newRecord = payload.new as { session_id?: string; id: string; event_type: string; created_at: string }
        const session = sessions.find(s => s.id === newRecord.session_id)
        setSessions(prev => prev.map(s => s.id === newRecord.session_id ? { ...s, cheating_events: [...s.cheating_events, newRecord as CheatingEvent] } : s))
        if (session) setLiveAlerts(prev => [{ id: newRecord.id, studentName: session.student_name || 'Unknown', type: 'violation' as const, message: `${newRecord.event_type} detected`, timestamp: new Date(newRecord.created_at) }, ...prev.slice(0, 4)])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, sessions])

  const filteredSessions = React.useMemo(() => {
    let result = [...sessions]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(s => s.student_name.toLowerCase().includes(q) || s.exam_title.toLowerCase().includes(q))
    }
    switch (filter) {
      case 'active': result = result.filter(s => s.status === 'active'); break
      case 'submitted': result = result.filter(s => s.status === 'submitted'); break
      case 'high_risk': result = result.filter(s => calculateRiskScore(s) > 50); break
      case 'safe': result = result.filter(s => calculateRiskScore(s) === 0); break
      case 'warning': result = result.filter(s => { const sc = calculateRiskScore(s); return sc > 0 && sc <= 50; }); break
      case 'critical': result = result.filter(s => calculateRiskScore(s) > 75); break
    }
    return result.sort((a, b) => new Date(b.started_at || 0).getTime() - new Date(a.started_at || 0).getTime())
  }, [sessions, filter, search])

  const filterCounts = React.useMemo(() => ({
    all: sessions.length,
    active: sessions.filter(s => s.status === 'active').length,
    submitted: sessions.filter(s => s.status === 'submitted').length,
    high_risk: sessions.filter(s => calculateRiskScore(s) > 50).length,
    safe: sessions.filter(s => calculateRiskScore(s) === 0).length,
    warning: sessions.filter(s => { const sc = calculateRiskScore(s); return sc > 0 && sc <= 50; }).length,
    critical: sessions.filter(s => calculateRiskScore(s) > 75).length,
  }), [sessions])

  const dismissAlert = React.useCallback((id: string) => { setLiveAlerts(prev => prev.filter(a => a.id !== id)) }, [])

  if (sessions.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Exam Sessions Yet</h3>
          <p className="text-white/50 max-w-md">Teacher will automatically receive live sessions once students begin an exam.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <LiveActivityBar alerts={liveAlerts} onDismiss={dismissAlert} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KpiCard title="Students" value={kpis.totalStudents} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} color="blue" delay={0} />
        <KpiCard title="Active" value={kpis.activeSessions} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} color="green" subtitle="Taking exam" delay={1} />
        <KpiCard title="Completed" value={kpis.completedSessions} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="purple" delay={2} />
        <KpiCard title="Violations" value={kpis.totalViolations} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} color="red" subtitle="Total today" delay={3} />
        <KpiCard title="High Risk" value={kpis.highRiskStudents} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="amber" delay={4} />
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Risk Overview</p>
          <div className="flex gap-2">
            <div className="flex-1 text-center"><span className="text-lg font-bold text-emerald-400">{kpis.safeCount}</span><p className="text-[10px] text-emerald-400/60">Safe</p></div>
            <div className="flex-1 text-center"><span className="text-lg font-bold text-amber-400">{kpis.warningCount}</span><p className="text-[10px] text-amber-400/60">Warn</p></div>
            <div className="flex-1 text-center"><span className="text-lg font-bold text-red-400">{kpis.criticalCount}</span><p className="text-[10px] text-red-400/60">Crit</p></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {(['all', 'active', 'submitted', 'high_risk', 'safe', 'warning', 'critical'] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filter === f ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/50 hover:text-white/80')}>
              {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} <span className="ml-1 text-[10px] opacity-60">({filterCounts[f]})</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[150px] sm:min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50" />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filteredSessions.map((session, idx) => (
          <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <StudentCard session={session} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface TeacherDashboardProps {
  sessions: SessionWithDetails[]
}