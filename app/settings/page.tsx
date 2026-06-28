'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Shield, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchUser()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-scientific">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-primary to-green-secondary animate-pulse" />
          <p className="text-pewter">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-scientific flex-1">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-20 sm:pt-24 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold text-carbon">Settings</h1>
          </div>
          <p className="text-pewter text-sm sm:text-base">Manage your account preferences and application settings.</p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-4 sm:space-y-6 pb-8">
          
          {/* Main User Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-l-4 border-green-primary"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-carbon">{profile?.name || 'User'}</h2>
              <span className={`inline-block mt-1 px-3 py-0.5 text-xs font-medium rounded-full ${
                profile?.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {profile?.role === 'teacher' ? 'Teacher' : 'Student'}
              </span>
              <p className="text-pewter mt-3 text-sm">
                Ensure your profile and security settings are up to date.
              </p>
            </div>
          </motion.div>

          {/* Profile & Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-primary flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-semibold text-carbon">Profile & Security</h2>
                </div>
                <p className="text-pewter text-sm sm:text-base max-w-lg">
                  Update your personal information, add your institution or student ID, and manage your password.
                </p>
              </div>
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-primary to-green-secondary text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm cursor-pointer relative z-10"
              >
                Go to Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Mobile Button */}
            <Link
              href="/profile"
              className="mt-4 sm:hidden w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-primary to-green-secondary text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm cursor-pointer relative z-10"
            >
              Go to Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
        </div>
      </div>
    </div>
  )
}