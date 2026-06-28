import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScientificBackground } from '@/components/ui/scientific-background'
import { StudentDashboardContent } from '@/components/student/student-dashboard-content'
import { calculateExamScore, Question, Answer } from '@/lib/utils/grading'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Session = Database['public']['Tables']['exam_sessions']['Row'] & { score?: number | null }
type Exam = Database['public']['Tables']['exams']['Row']

export const metadata: Metadata = { title: 'Student Dashboard - ExamGuard' }

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  if (profile?.role === 'teacher') redirect('/dashboard-guru')

  // Fetch ALL exams (regardless of sessions)
  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Exam[] | null }

  // Fetch student's exam sessions with cheating_events, student_answers, and questions for grading
  const { data: rawSessions } = await supabase
    .from('exam_sessions')
    .select('*, cheating_events(*), student_answers(*), exams(*, questions(*))')
    .eq('student_id', user.id)

  const sessions = (rawSessions || []).map((session: Record<string, unknown>) => ({
    ...session,
    score: session.status === 'submitted' ? calculateExamScore((session.exams as Record<string, unknown>)?.questions as Question[] || [], (session.student_answers as Answer[]) || []) : null
  })) as Session[]

  return (
    <div className="min-h-screen relative">
      <ScientificBackground />
      <StudentDashboardContent
        exams={exams || []}
        sessions={sessions || []}
      />
    </div>
  )
}
