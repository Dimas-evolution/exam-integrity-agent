import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SessionViewerClient } from '@/components/teacher/client-session-viewer'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Session = Database['public']['Tables']['exam_sessions']['Row']
type Exam = Database['public']['Tables']['exams']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type StudentAnswer = Database['public']['Tables']['student_answers']['Row']
type CheatingEvent = Database['public']['Tables']['cheating_events']['Row']

export const metadata: Metadata = {
  title: 'Tinjauan Sesi Ujian - Exam Integrity',
}

export default async function StudentSessionPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ tab?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const sessionId = resolvedParams.id
  const initialTab = (resolvedSearchParams.tab === 'timeline') ? 'timeline' : 'answers'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'role'> | null }

  if (profile?.role !== 'teacher') redirect('/dashboard-mahasiswa')

  // Fetch session
  const { data: session } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('id', sessionId)
    .single() as { data: Session | null }

  if (!session) redirect('/dashboard-guru')

  // Fetch exam
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', session.exam_id)
    .single() as { data: Exam | null }

  // Fetch student profile
  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.student_id)
    .single() as { data: Profile | null }

  // Fetch questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', session.exam_id)
    .order('question_order', { ascending: true }) as { data: Question[] | null }

  // Fetch answers
  const { data: answers } = await supabase
    .from('student_answers')
    .select('*')
    .eq('session_id', sessionId) as { data: StudentAnswer[] | null }

  // Fetch cheating events
  const { data: cheatingEvents } = await supabase
    .from('cheating_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true }) as { data: CheatingEvent[] | null }

  if (!exam || !student) {
    redirect('/dashboard-guru')
  }

  return (
    <SessionViewerClient 
      session={session}
      exam={exam}
      student={student}
      questions={questions || []}
      answers={answers || []}
      cheatingEvents={cheatingEvents || []}
      initialTab={initialTab}
    />
  )
}
