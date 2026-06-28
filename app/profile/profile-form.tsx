'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Shield, Save, Loader2, Lock, Key } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  profile: {
    id: string
    name: string
    email: string
    role: 'teacher' | 'student'
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')
  
  // Info State
  const [name, setName] = useState(profile.name || '')
  
  // Security State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: name.trim()
        })
        .eq('id', profile.id)

      if (error) {
        setMessage({ type: 'error', text: 'Gagal memperbarui profil. Silakan coba lagi.' })
      } else {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' })
        router.refresh()
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru dan konfirmasi password tidak cocok.' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setMessage({ type: 'error', text: 'Gagal mengubah password: ' + error.message })
      } else {
        setMessage({ type: 'success', text: 'Password berhasil diubah!' })
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem.' })
    } finally {
      setLoading(false)
    }
  }

  const isTeacher = profile.role === 'teacher'
  
  const hasInfoChanged = name.trim() !== (profile.name || '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Avatar Section */}
      <div className="p-6 sm:p-8 bg-white/50 border-b border-cloud flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
          {profile.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-semibold text-carbon">{profile.name}</h2>
          <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-sm font-medium rounded-full ${
            isTeacher ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            {isTeacher ? 'Guru / Pengajar' : 'Mahasiswa'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-cloud px-4 sm:px-8 bg-white/30">
        <button
          onClick={() => { setActiveTab('info'); setMessage(null) }}
          className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'info' 
              ? 'border-green-primary text-green-primary' 
              : 'border-transparent text-pewter hover:text-carbon'
          }`}
        >
          <User className="w-4 h-4" />
          Informasi Pribadi
        </button>
        <button
          onClick={() => { setActiveTab('security'); setMessage(null) }}
          className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'security' 
              ? 'border-green-primary text-green-primary' 
              : 'border-transparent text-pewter hover:text-carbon'
          }`}
        >
          <Key className="w-4 h-4" />
          Keamanan
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {/* Message Banner */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'info' ? (
          <motion.form 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleInfoSubmit} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-carbon mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-modern !pl-14"
                    placeholder="Masukkan nama lengkap"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-carbon mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
                  <input
                    type="email"
                    id="email"
                    value={profile.email}
                    className="input-modern !pl-14 bg-gray-50 text-pewter cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Role Field (Read-only) */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-carbon mb-2">
                  Tipe Akun
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
                  <input
                    type="text"
                    id="role"
                    value={isTeacher ? 'Guru / Pengajar' : 'Mahasiswa'}
                    className="input-modern !pl-14 bg-gray-50 text-pewter cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-cloud mt-8">
              <button
                type="submit"
                disabled={loading || !hasInfoChanged}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-primary to-green-secondary text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Simpan Perubahan
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handlePasswordSubmit} 
            className="space-y-6 max-w-md"
          >
            <div className="mb-6">
              <h3 className="text-lg font-medium text-carbon">Ubah Kata Sandi</h3>
              <p className="text-sm text-pewter mt-1">Pastikan password baru Anda kuat dan mudah diingat.</p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-carbon mb-2">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-modern !pl-14"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-carbon mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-modern !pl-14"
                  placeholder="Ketik ulang password baru"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-carbon text-white font-medium rounded-xl shadow-lg hover:bg-graphite transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                Perbarui Password
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </motion.div>
  )
}