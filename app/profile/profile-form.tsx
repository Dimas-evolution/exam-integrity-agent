'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProfileFormProps {
  profile: {
    id: string
    name: string
    email: string
    role: 'teacher' | 'student'
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [name, setName] = useState(profile.name)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', profile.id)

      if (error) {
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
    }
  }

  const isTeacher = profile.role === 'teacher'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-8"
    >
      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 pb-6 border-b border-cloud">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
          {profile.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-semibold text-carbon">{profile.name}</h2>
          <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
            isTeacher ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
          }`}>
            {isTeacher ? 'Teacher' : 'Student'}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-carbon mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-modern pl-14"
              placeholder="Enter your full name"
              required
              minLength={2}
              maxLength={100}
            />
          </div>
          <p className="text-xs text-pewter mt-2">
            This name will be displayed to other users.
          </p>
        </div>

        {/* Email Field (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-carbon mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
            <input
              type="email"
              id="email"
              value={profile.email}
              className="input-modern pl-14 bg-surface-2 cursor-not-allowed"
              readOnly
              disabled
            />
          </div>
          <p className="text-xs text-pewter mt-2">
            Email cannot be changed. Contact administrator if needed.
          </p>
        </div>

        {/* Role Field (Read-only) */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-carbon mb-2">
            Account Type
          </label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
            <input
              type="text"
              id="role"
              value={isTeacher ? 'Teacher' : 'Student'}
              className="input-modern pl-14 bg-surface-2 cursor-not-allowed"
              readOnly
              disabled
            />
          </div>
          <p className="text-xs text-pewter mt-2">
            Account type is assigned by the administrator.
          </p>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <motion.button
            type="submit"
            disabled={loading || name.trim() === profile.name}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-primary to-green-secondary text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}