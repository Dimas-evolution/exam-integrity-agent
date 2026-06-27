'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'

type Exam = Database['public']['Tables']['exams']['Row']

export function ExamList({ exams, studentId }: { exams: Exam[], studentId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loadingId, setLoadingId] = React.useState<string | null>(null)

  const startExam = async (examId: string) => {
    setLoadingId(examId)
    try {
      const { data: existingSession } = await supabase
        .from('exam_sessions')
        .select('status')
        .eq('exam_id', examId)
        .eq('student_id', studentId)
        .single() as { data: { status: string } | null }

      if (existingSession) {
        if (existingSession.status === 'active') {
           router.push(`/dashboard-mahasiswa/exam/${examId}`)
        } else {
           alert('Exam already submitted')
        }
        return
      }

      const { data: newSession, error: createError } = await supabase
        .from('exam_sessions')
        .insert({
          exam_id: examId,
          student_id: studentId,
          status: 'active'
        } as never)
        .select()
        .single()
        
      if (createError) throw createError
      
      if (newSession) {
        router.push(`/dashboard-mahasiswa/exam/${examId}`)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to start exam')
    } finally {
      setLoadingId(null)
    }
  }

  if (exams.length === 0) {
    return <div className="text-graphite">No exams available at the moment.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <div key={exam.id} className="border border-cloud rounded-[4px] p-6 hover:shadow-[0_0_0_1px_#EEE] transition-tesla flex flex-col h-[200px]">
          <h3 className="text-[17px] font-medium text-carbon line-clamp-2">{exam.title}</h3>
          <p className="text-[14px] text-graphite mt-2 line-clamp-2 flex-grow">
            {exam.description || 'No description provided'}
          </p>
          <div className="mt-4 pt-4 border-t border-cloud">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => startExam(exam.id)}
              disabled={loadingId === exam.id}
            >
              {loadingId === exam.id ? 'Starting...' : 'Start Exam'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}