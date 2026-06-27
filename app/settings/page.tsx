'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Shield, Bell, Lock, Palette } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
      setLoading(false)
    }
    verifyAuth()
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
    <div className="min-h-screen bg-scientific overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center flex-shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold text-carbon">Settings</h1>
          </div>
          <p className="text-pewter text-sm sm:text-base">Manage your account preferences and application settings.</p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-4 sm:space-y-6 pb-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-primary flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-carbon">Profile Settings</h2>
            </div>
            <p className="text-pewter mb-4 text-sm sm:text-base">
              Manage your profile information.
            </p>
            <a
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-primary to-green-secondary text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm sm:text-base"
            >
              Edit Profile
            </a>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-green-primary flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-carbon">Notifications</h2>
            </div>
            <p className="text-pewter mb-4 text-sm sm:text-base">
              Configure how you receive notifications and alerts.
            </p>
            <div className="flex items-center gap-3 text-sm text-pewter">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span>Email notifications enabled</span>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-primary flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-carbon">Security</h2>
            </div>
            <p className="text-pewter mb-4 text-sm sm:text-base">
              Manage your password and security preferences.
            </p>
            <div className="flex items-center gap-3 text-sm text-pewter">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span>Two-factor authentication available</span>
            </div>
          </motion.div>

          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-green-primary flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-carbon">Appearance</h2>
            </div>
            <p className="text-pewter mb-4 text-sm sm:text-base">
              Customize the look and feel of your dashboard.
            </p>
            <div className="flex items-center gap-3 text-sm text-pewter">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span>Light mode active</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}