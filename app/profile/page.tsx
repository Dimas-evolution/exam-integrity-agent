import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export const metadata: Metadata = {
  title: 'Profile - ExamGuard',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-carbon tracking-tight">
            Profile Settings
          </h1>
          <p className="text-sm sm:text-base text-pewter mt-1">
            Manage your account information
          </p>
        </div>

        {/* Profile Form */}
        <ProfileForm 
          profile={{
            id: profile.id,
            name: profile.name,
            email: user.email || '',
            role: profile.role,
            identity_number: profile.identity_number,
            institution: profile.institution,
          }}
        />
      </div>
    </div>
  )
}