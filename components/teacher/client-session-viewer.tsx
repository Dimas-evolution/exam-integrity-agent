'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock, Copy, MousePointer2, EyeOff, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Session = Database['public']['Tables']['exam_sessions']['Row']
type Exam = Database['public']['Tables']['exams']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type StudentAnswer = Database['public']['Tables']['student_answers']['Row']
type CheatingEvent = Database['public']['Tables']['cheating_events']['Row']

interface SessionViewerClientProps {
  session: Session
  exam: Exam
  student: Profile
  questions: Question[]
  answers: StudentAnswer[]
  cheatingEvents: CheatingEvent[]
  initialTab: 'answers' | 'timeline'
}

const VIOLATION_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  tab_switch: { label: 'Tab Switch', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  copy_paste: { label: 'Copy Paste', icon: Copy, color: 'text-red-600', bg: 'bg-red-50' },
  mouse_leave: { label: 'Mouse Leave', icon: MousePointer2, color: 'text-purple-600', bg: 'bg-purple-50' },
  visibility_hidden: { label: 'Visibility Hidden', icon: EyeOff, color: 'text-blue-600', bg: 'bg-blue-50' },
}

export function SessionViewerClient({
  session,
  exam,
  student,
  questions,
  answers,
  cheatingEvents,
  initialTab
}: SessionViewerClientProps) {
  const [activeTab, setActiveTab] = useState<'answers' | 'timeline'>(initialTab)

  // Calc score
  let correctAnswersCount = 0
  let totalMCQ = 0
  let totalEssay = 0

  questions.forEach(q => {
    if (q.question_type === 'essay') {
      totalEssay++
      return
    }
    totalMCQ++
    const studentAns = answers.find(a => a.question_id === q.id)
    if (studentAns && studentAns.answer === q.correct_answer) {
      correctAnswersCount++
    }
  })

  const finalScore = totalMCQ > 0 ? Math.round((correctAnswersCount / totalMCQ) * 100) : 0

  // Risk calculation
  let riskScore = 0
  cheatingEvents.forEach(ce => {
    switch (ce.event_type) {
      case 'copy_paste': riskScore += 30; break
      case 'tab_switch': riskScore += 15; break
      case 'mouse_leave': riskScore += 10; break
      case 'visibility_hidden': riskScore += 25; break
    }
  })
  riskScore = Math.min(100, riskScore)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Print-only CSS injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}} />

      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 no-print">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/dashboard-guru"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali ke Dashboard</span>
          </Link>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8" id="print-area">
        {/* Laporan Header */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Laporan Ujian Mahasiswa</h1>
              <p className="text-slate-500 mb-6">{exam.title}</p>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Mahasiswa</p>
                  <p className="font-semibold text-slate-900">{student.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Waktu Submit</p>
                  <p className="font-semibold text-slate-900">
                    {session.completed_at ? new Date(session.completed_at).toLocaleString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center min-w-[120px] border border-slate-200">
                <p className="text-xs text-slate-500 font-medium mb-1">Final Score</p>
                <p className="text-3xl font-black text-slate-900">{finalScore}</p>
              </div>
              <div className={`rounded-xl p-4 text-center min-w-[120px] border ${riskScore > 50 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <p className={`text-xs font-medium mb-1 ${riskScore > 50 ? 'text-red-600' : 'text-emerald-700'}`}>Risk Score</p>
                <p className={`text-3xl font-black ${riskScore > 50 ? 'text-red-600' : 'text-emerald-700'}`}>{riskScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Control */}
        <div className="flex gap-4 border-b border-slate-200 mb-6 no-print">
          <button
            onClick={() => setActiveTab('answers')}
            className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'answers' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Jawaban Mahasiswa
            {activeTab === 'answers' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'timeline' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Timeline Pelanggaran
            {activeTab === 'timeline' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Tab: Answers */}
        <div className={activeTab !== 'answers' ? 'hidden print:block print:break' : 'block print:block print:break'}>
          <div className="hidden print:block mb-6">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Detail Jawaban</h2>
          </div>
          
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const studentAns = answers.find(a => a.question_id === q.id)
              const isCorrect = studentAns?.answer === q.correct_answer
              const hasAnswered = !!studentAns?.answer

              return (
                <div key={q.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
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
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" /> Benar
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
                            <XCircle className="w-4 h-4" /> Salah
                          </div>
                        )}
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
                          bgClass = "bg-emerald-50 border-emerald-200"
                          textClass = "text-emerald-800 font-medium"
                        } else if (isStudentChoice && !isCorrectChoice) {
                          bgClass = "bg-red-50 border-red-200"
                          textClass = "text-red-800"
                        }

                        return (
                          <div key={oIdx} className={`p-3 rounded-lg border ${bgClass} ${textClass} flex items-center justify-between`}>
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isStudentChoice && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/50 px-2 py-1 rounded">
                                Dipilih Mahasiswa
                              </span>
                            )}
                          </div>
                        )
                      })}
                      {!hasAnswered && (
                        <p className="text-sm text-red-500 font-medium mt-3">Tidak dijawab</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pl-11">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700 whitespace-pre-wrap">
                        {studentAns?.answer ? studentAns.answer : <span className="text-slate-400 italic">Tidak dijawab</span>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Tab: Timeline */}
        <div className={activeTab !== 'timeline' ? 'hidden print:block print-break' : 'block print:block print-break'}>
          <div className="hidden print:block mb-6 mt-12">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Timeline Pelanggaran</h2>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {cheatingEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Bersih!</h3>
                <p className="text-slate-500">Tidak ada indikasi kecurangan yang terdeteksi.</p>
              </div>
            ) : (
              <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {cheatingEvents.map((event, idx) => {
                  const config = VIOLATION_CONFIG[event.event_type] || VIOLATION_CONFIG['tab_switch']
                  const Icon = config.icon

                  return (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Marker */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${config.bg} shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      
                      {/* Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold text-sm ${config.color}`}>{config.label}</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(event.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {event.question_number ? `Terjadi saat mengerjakan Soal ${event.question_number}` : 'Terjadi saat ujian'}
                        </p>
                        {event.duration_seconds && event.duration_seconds > 0 && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-medium text-slate-500">
                            <Clock className="w-3 h-3" />
                            Durasi: {event.duration_seconds} detik
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
