import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExamSession } from '@/components/exam/exam-session'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Session = Database['public']['Tables']['exam_sessions']['Row']
type Exam = Database['public']['Tables']['exams']['Row']

export const metadata: Metadata = {
  title: 'Exam Session - Exam Integrity',
}

export default async function ExamSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const examId = resolvedParams.id
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

  if (profile?.role !== 'student') {
    redirect('/dashboard-guru')
  }

  // Verify session
  const { data: session } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('exam_id', examId)
    .eq('student_id', user.id)
    .single() as { data: Session | null }

  if (!session || session.status !== 'active') {
    redirect('/dashboard-mahasiswa')
  }

  // Fetch exam details
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single() as { data: Exam | null }

  if (!exam) {
    redirect('/dashboard-mahasiswa')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white/75 backdrop-blur-md border-b border-cloud transition-colors duration-330">
        <div className="max-w-[1383px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-medium tracking-wide">EXAM INTEGRITY</div>
          <div className="text-[14px] text-[#D9534F] font-medium animate-pulse">
            Monitoring Active
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1383px] w-full mx-auto px-4 py-8 flex flex-col">
        <ExamSession exam={exam} session={session} />
      </main>
    </div>
  )
}
