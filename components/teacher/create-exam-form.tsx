'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react'

type Question = {
  question_text: string
  question_order: number
  question_type: 'multiple_choice' | 'essay'
  options: string[]
  correct_answer: string
}

export function CreateExamForm({ teacherId }: { teacherId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(60)

  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      question_order: 1,
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '0',
    },
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_order: questions.length + 1,
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '0',
      },
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return
    const newQuestions = questions.filter((_, i) => i !== index)
    // Update order
    newQuestions.forEach((q, i) => {
      q.question_order = i + 1
    })
    setQuestions(newQuestions)
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options[optIndex] = value
    setQuestions(newQuestions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Validasi dasar
      if (!title) throw new Error('Judul ujian harus diisi')
      for (const q of questions) {
        if (!q.question_text) throw new Error(`Soal nomor ${q.question_order} tidak boleh kosong`)
        if (q.question_type === 'multiple_choice') {
          if (q.options.some((opt) => !opt)) {
            throw new Error(`Semua opsi (A, B, C, D) pada soal nomor ${q.question_order} harus diisi`)
          }
        }
      }

      // 2. Insert Ujian
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          title,
          description,
          duration_minutes: duration,
          teacher_id: teacherId,
        })
        .select()
        .single()

      if (examError) throw examError

      // 3. Insert Pertanyaan
      const questionsToInsert = questions.map((q) => ({
        exam_id: examData.id,
        question_text: q.question_text,
        question_order: q.question_order,
        question_type: q.question_type,
        options: q.question_type === 'multiple_choice' ? q.options : null,
        // correct_answer in DB is text. If multiple choice, we store the actual option text as correct answer
        // to make it easier for auto-grading later.
        correct_answer:
          q.question_type === 'multiple_choice' ? q.options[parseInt(q.correct_answer)] : q.correct_answer,
      }))

      const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert)

      if (questionsError) throw questionsError

      // Berhasil
      router.push('/dashboard-guru')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan ujian.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-pewter hover:text-carbon transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Detail Ujian */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-carbon mb-6">Detail Ujian</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-carbon mb-1">Judul Ujian</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Ujian Tengah Semester Pemrograman Web"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-carbon mb-1">Deskripsi (Opsional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instruksi atau keterangan tentang ujian ini..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-carbon mb-1">Durasi (Menit)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min={1}
                className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Daftar Soal */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-carbon">Daftar Soal</h2>
            <span className="text-sm text-pewter bg-gray-50 px-3 py-1 rounded-full font-medium border border-gray-200">
              Total: {questions.length} Soal
            </span>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-carbon">Soal Nomor {q.question_order}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <textarea
                    value={q.question_text}
                    onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                    placeholder="Ketik pertanyaan di sini..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-y"
                    required
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-carbon mb-3">Pilihan Jawaban</p>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((letter, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct_${qIndex}`}
                          checked={q.correct_answer === optIndex.toString()}
                          onChange={() => updateQuestion(qIndex, 'correct_answer', optIndex.toString())}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                        />
                        <span className="font-medium text-carbon w-4">{letter}.</span>
                        <input
                          type="text"
                          value={q.options[optIndex]}
                          onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                          placeholder={`Pilihan ${letter}`}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-pewter mt-3 italic">
                    * Pilih tombol radio (lingkaran) di sebelah kiri untuk menandai Kunci Jawaban yang benar.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm flex items-center">
            <span className="font-medium mr-2">Error:</span> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 sticky bottom-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <button
            type="button"
            onClick={addQuestion}
            className="flex-1 flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-carbon font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Soal Baru
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Simpan & Terbitkan Ujian
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
