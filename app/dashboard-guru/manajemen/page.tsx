import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { ArrowLeft, Edit, Trash2, BookOpen } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Manajemen Ujian - Exam Integrity',
}

export default async function ExamManagementPage() {
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

  // Fetch exams created by this teacher
  const { data: rawExams } = await supabase
    .from('exams')
    .select(`
      *,
      questions(count)
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  // Since questions(count) returns an array with a count object, we can map it
  const exams = (rawExams || []).map((exam: any) => ({
    ...exam,
    question_count: exam.questions?.[0]?.count || 0
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard-guru"
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard Utama
          </Link>
          <Link
            href="/dashboard-guru/buat-ujian"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Buat Ujian Baru
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-slate-800">Manajemen Ujian</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola dan edit daftar ujian yang pernah Anda buat.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                  <th className="px-6 py-4 font-medium">Nama Ujian</th>
                  <th className="px-6 py-4 font-medium text-center">Durasi</th>
                  <th className="px-6 py-4 font-medium text-center">Jumlah Soal</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      Anda belum membuat ujian apapun.
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{exam.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{exam.description || 'Tanpa deskripsi'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {exam.duration_minutes || 60} Menit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600 font-medium">{exam.question_count} Soal</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard-guru/edit-ujian/${exam.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Ujian"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
