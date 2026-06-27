'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, Clock, BookOpen, ArrowRight, CheckCircle, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/date'
import type { Database } from '@/types/supabase'

type Session = Database['public']['Tables']['exam_sessions']['Row']
type Exam = Database['public']['Tables']['exams']['Row']

interface Props {
  exams: Exam[]
  sessions: Session[]
}

export function StudentDashboardContent({ exams, sessions }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null)

  const activeSessions = sessions.filter(s => s.status === 'active')
  const completedSessions = sessions.filter(s => s.status === 'submitted')

  const getSessionForExam = (examId: string) => {
    return sessions.find(s => s.exam_id === examId)
  }

  const startExam = async (examId: string) => {
    setLoadingExamId(examId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const existingSession = sessions.find(s => s.exam_id === examId)
      if (existingSession) {
        router.push(`/dashboard-mahasiswa/exam/${examId}`)
        return
      }

      const { error } = await supabase
        .from('exam_sessions')
        .insert({
          exam_id: examId,
          student_id: user.id,
          current_question_index: 0,
          status: 'active',
          started_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Failed to start exam:', error)
        return
      }

      router.push(`/dashboard-mahasiswa/exam/${examId}`)
    } finally {
      setLoadingExamId(null)
    }
  }

  return (
    <div className="relative z-10 pb-10">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-carbon tracking-tight">Your Exams</h1>
          <p className="text-sm sm:text-base text-pewter mt-1">Focus workspace for your assessments</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0"><Eye className="w-5 h-5 sm:w-6 sm:h-6 text-green-primary" /></div>
              <div><p className="text-xs sm:text-sm text-pewter">Active</p><p className="text-xl sm:text-2xl font-semibold text-carbon">{activeSessions.length}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /></div>
              <div><p className="text-xs sm:text-sm text-pewter">Completed</p><p className="text-xl sm:text-2xl font-semibold text-carbon">{completedSessions.length}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"><BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" /></div>
              <div><p className="text-xs sm:text-sm text-pewter">Total</p><p className="text-xl sm:text-2xl font-semibold text-carbon">{exams.length}</p></div>
            </div>
          </motion.div>
        </div>

        <section>
          <h2 className="text-base sm:text-lg font-semibold text-carbon mb-4">Available Exams</h2>
          {exams.length > 0 ? (
            <div className="grid gap-3 sm:gap-4">
              {exams.map((exam, idx) => {
                const session = getSessionForExam(exam.id)
                const isActive = session?.status === 'active'
                const isCompleted = session?.status === 'submitted'
                const isLoading = loadingExamId === exam.id

                return (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-br from-green-primary to-green-secondary'
                          : isCompleted
                          ? 'bg-surface-2'
                          : 'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}>
                        {isActive ? (
                          <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-pewter" />
                        ) : (
                          <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-carbon text-sm sm:text-base truncate">{exam.title}</h3>
                        <p className="text-xs sm:text-sm text-pewter mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                          {exam.description || 'No description'}
                        </p>
                        {session && (
                          <p className="text-[10px] sm:text-xs text-pewter mt-1">
                            Started {formatDate(session.started_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {isActive ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-medium">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> In Progress
                        </div>
                      ) : isCompleted ? (
                        <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-surface-2 text-pewter text-xs sm:text-sm font-medium">
                          Submitted
                        </div>
                      ) : null}

                      {isActive ? (
                        <motion.a
                          href={`/dashboard-mahasiswa/exam/${exam.id}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-green-primary to-green-secondary text-white text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                        >
                          Continue <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.a>
                      ) : isCompleted ? (
                        <motion.a
                          href={`/dashboard-mahasiswa/exam/${exam.id}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-surface text-carbon text-xs sm:text-sm font-medium border border-cloud hover:bg-surface-2 transition-all whitespace-nowrap"
                        >
                          View <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.a>
                      ) : (
                        <motion.button
                          onClick={() => startExam(exam.id)}
                          disabled={isLoading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                          {isLoading ? (
                            <motion.div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
                          ) : (
                            <>Start Exam <Play className="w-3 h-3 sm:w-4 sm:h-4" /></>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-cloud mb-4" />
              <p className="text-pewter text-sm sm:text-base">No exams available yet</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}