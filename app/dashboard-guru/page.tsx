import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeacherDashboard } from '@/components/teacher/teacher-dashboard'
import { calculateExamScore, Question } from '@/lib/utils/grading'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Exam = Database['public']['Tables']['exams']['Row']
type Session = Database['public']['Tables']['exam_sessions']['Row']
type CheatingEvent = Database['public']['Tables']['cheating_events']['Row']
type StudentAnswer = Database['public']['Tables']['student_answers']['Row']

export const metadata: Metadata = {
  title: 'Teacher Dashboard - Exam Integrity',
}

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
  score?: number | null
}

export default async function TeacherDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  if (profile?.role !== 'teacher') {
    redirect('/dashboard-mahasiswa')
  }

  const { data: sessions } = await supabase
    .from('exam_sessions')
    .select(`
      *,
      exams:exams!exam_sessions_exam_id_fkey(
        id,
        title,
        description,
        teacher_id,
        questions(
          id,
          correct_answer
        )
      ),
      profiles:profiles!exam_sessions_student_id_fkey(
        id,
        name
      ),
      cheating_events(
        id,
        session_id,
        event_type,
        question_number,
        duration_seconds,
        details,
        created_at
      ),
      student_answers(
        id,
        session_id,
        question_id,
        answer,
        answered_at
      )
    `)
    .order('started_at', { ascending: false }) as { data: (Session & {
      exams: Pick<Exam, 'id' | 'title' | 'description' | 'teacher_id'> & { questions: Question[] };
      profiles: Pick<Profile, 'id' | 'name'>;
      cheating_events: CheatingEvent[];
      student_answers: StudentAnswer[];
    })[] | null, error: unknown | null }

  const allSessions: SessionWithDetails[] = (sessions || [])
    .filter(session => session.exams?.teacher_id === user.id)
    .map(session => ({
      ...session,
      exams: { id: session.exams?.id || '', title: session.exams?.title || 'Unknown Exam', description: session.exams?.description || null },
      profiles: { id: session.profiles?.id || '', name: session.profiles?.name || 'Unknown Student' },
      cheating_events: session.cheating_events || [],
      student_answers: session.student_answers || [],
      exam_title: session.exams?.title || 'Unknown Exam',
      student_name: session.profiles?.name || 'Unknown Student',
      exam_description: session.exams?.description || undefined,
      duration_minutes: 60,
      score: session.status === 'submitted' ? calculateExamScore(session.exams?.questions || [], session.student_answers || []) : null
    }))

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 sm:mb-10 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold tracking-tight text-carbon">Security Monitoring Center</h1>
            <p className="text-sm sm:text-base text-pewter mt-1">Real-time exam integrity surveillance</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/dashboard-guru/manajemen" className="inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Kelola Ujian
            </a>
            <a href="/dashboard-guru/buat-ujian" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Buat Ujian Baru
            </a>
          </div>
        </div>
        <TeacherDashboard sessions={allSessions} />
      </main>
    </div>
  )
}