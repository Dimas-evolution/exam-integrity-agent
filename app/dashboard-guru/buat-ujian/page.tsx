import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateExamForm } from '@/components/teacher/create-exam-form'

export const metadata: Metadata = {
  title: 'Buat Ujian Baru - Teacher Dashboard',
}

export default async function CreateExamPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') {
    redirect('/dashboard-mahasiswa')
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-carbon">Buat Ujian Baru</h1>
          <p className="text-sm sm:text-base text-pewter mt-1">
            Rancang soal ujian, atur opsi, dan simpan untuk dikerjakan mahasiswa.
          </p>
        </div>
        
        <CreateExamForm teacherId={user.id} />
      </main>
    </div>
  )
}
