import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Session = Database['public']['Tables']['exam_sessions']['Row']
type Exam = Database['public']['Tables']['exams']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type StudentAnswer = Database['public']['Tables']['student_answers']['Row']

export const metadata: Metadata = {
  title: 'Exam Result - Exam Integrity',
}

export default async function ExamResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const examId = resolvedParams.id
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'role'> | null }

  if (profile?.role !== 'student') redirect('/dashboard-guru')

  // Fetch session
  const { data: session } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('exam_id', examId)
    .eq('student_id', user.id)
    .single() as { data: Session | null }

  if (!session || session.status !== 'submitted') {
    redirect('/dashboard-mahasiswa')
  }

  // Fetch exam
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single() as { data: Exam | null }

  if (!exam) redirect('/dashboard-mahasiswa')

  // Fetch questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId)
    .order('question_order', { ascending: true }) as { data: Question[] | null }

  // Fetch answers
  const { data: answers } = await supabase
    .from('student_answers')
    .select('*')
    .eq('session_id', session.id) as { data: StudentAnswer[] | null }

  const questionList = questions || []
  const answerList = answers || []

  // Re-calculate score just in case, or we can fetch it if we stored it (we don't store score in DB yet)
  let correctAnswersCount = 0
  let totalMCQ = 0
  let totalEssay = 0

  questionList.forEach(q => {
    if (q.question_type === 'essay') {
      totalEssay++
      return
    }
    
    totalMCQ++
    const studentAns = answerList.find(a => a.question_id === q.id)
    if (studentAns && studentAns.answer === q.correct_answer) {
      correctAnswersCount++
    }
  })

  const finalScore = totalMCQ > 0 ? Math.round((correctAnswersCount / totalMCQ) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/dashboard-mahasiswa"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali ke Dashboard</span>
          </Link>
          <div className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-md">
            {exam.title}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Score Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Hasil Ujian</h1>
          <p className="text-slate-500 mb-8">{exam.title}</p>
          
          <div className="inline-flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 border-green-50 bg-green-50/50 mb-6 relative">
            <span className="text-4xl sm:text-5xl font-black text-green-600">{finalScore}</span>
            <span className="text-sm font-medium text-green-600/70 absolute bottom-4">/ 100</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm">
            <div className="flex flex-col items-center">
              <span className="text-slate-500 font-medium">Soal Pilihan Ganda</span>
              <span className="text-lg font-bold text-slate-900">{correctAnswersCount} <span className="text-slate-400 text-sm font-normal">dari {totalMCQ} Benar</span></span>
            </div>
            {totalEssay > 0 && (
              <div className="flex flex-col items-center">
                <span className="text-slate-500 font-medium">Soal Esai</span>
                <span className="text-lg font-bold text-slate-900">{totalEssay} <span className="text-slate-400 text-sm font-normal">Menunggu Penilaian</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Answers */}
        <h2 className="text-lg font-bold text-slate-900 mb-4 px-2">Detail Jawaban</h2>
        
        <div className="space-y-6">
          {questionList.map((q, idx) => {
            const studentAns = answerList.find(a => a.question_id === q.id)
            const isCorrect = studentAns?.answer === q.correct_answer
            const hasAnswered = !!studentAns?.answer

            return (
              <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <h3 className="font-medium text-slate-900">{q.question_text}</h3>
                  </div>
                  {q.question_type === 'multiple_choice' && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Benar
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                          <XCircle className="w-4 h-4" /> Salah
                        </div>
                      )}
                    </div>
                  )}
                  {q.question_type === 'essay' && (
                    <div className="flex-shrink-0">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                        <AlertCircle className="w-4 h-4" /> Belum Dinilai
                      </div>
                    </div>
                  )}
                </div>

                {q.question_type === 'multiple_choice' ? (
                  <div className="space-y-2 mt-4 pl-11">
                    {(q.options as string[] || []).map((opt, oIdx) => {
                      const isStudentChoice = studentAns?.answer === opt
                      const isCorrectChoice = q.correct_answer === opt

                      let bgClass = "bg-slate-50 border-slate-200"
                      let textClass = "text-slate-600"
                      
                      if (isCorrectChoice) {
                        bgClass = "bg-green-50 border-green-200"
                        textClass = "text-green-800 font-medium"
                      } else if (isStudentChoice && !isCorrectChoice) {
                        bgClass = "bg-red-50 border-red-200"
                        textClass = "text-red-800"
                      }

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border ${bgClass} ${textClass} flex items-center justify-between`}>
                          <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {isStudentChoice && (
                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                              Jawaban Anda
                            </span>
                          )}
                        </div>
                      )
                    })}
                    {!hasAnswered && (
                       <p className="text-sm text-red-500 font-medium mt-3">Kosong (Tidak dijawab)</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 pl-11">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 whitespace-pre-wrap min-h-[100px]">
                      {studentAns?.answer ? studentAns.answer : <span className="text-slate-400 italic">Kosong (Tidak dijawab)</span>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
