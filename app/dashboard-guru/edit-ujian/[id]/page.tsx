import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateExamForm } from '@/components/teacher/create-exam-form'
import { Database } from '@/types/supabase'

type Exam = Database['public']['Tables']['exams']['Row']
type QuestionRow = Database['public']['Tables']['questions']['Row']

export const metadata: Metadata = {
  title: 'Edit Ujian - Exam Integrity',
}

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const examId = resolvedParams.id
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (profile?.role !== 'teacher') {
    redirect('/dashboard-mahasiswa')
  }

  // Fetch existing exam
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single() as unknown as { data: Exam | null, error: any }

  if (examError || !exam || exam.teacher_id !== user.id) {
    redirect('/dashboard-guru/manajemen')
  }

  // Fetch questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId)
    .order('question_order', { ascending: true }) as unknown as { data: QuestionRow[] | null }

  // Format initial data
  const initialData = {
    id: exam.id,
    title: exam.title,
    description: exam.description || '',
    duration: exam.duration_minutes || 60,
    questions: (questions || []).map((q) => {
      let options = ['', '', '', '']
      let correct_answer = '0'
      
      if (q.question_type === 'multiple_choice' && Array.isArray(q.options)) {
        options = q.options as string[]
        // Fill up to 4 options
        while (options.length < 4) options.push('')
        
        // Find index of correct answer
        const idx = options.indexOf(q.correct_answer || '')
        correct_answer = idx !== -1 ? idx.toString() : '0'
      }

      return {
        id: q.id,
        question_text: q.question_text,
        question_order: q.question_order,
        question_type: q.question_type as 'multiple_choice' | 'essay',
        options,
        correct_answer
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Ujian</h1>
          <p className="text-slate-500 mt-2">Ubah informasi dan soal ujian Anda.</p>
        </div>
        
        <CreateExamForm teacherId={user.id} initialData={initialData} />
      </div>
    </div>
  )
}
