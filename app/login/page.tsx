'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ScientificBackground } from '@/components/ui/scientific-background'
import { Toast, useToast } from '@/components/ui/toast'
import { createClient, Profile } from '@/lib/supabase/client'
import { Shield, Eye, Lock, Mail, ArrowRight, GraduationCap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const router = useRouter()
  const supabase = createClient()
  const { toast, showToast, hideToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('LOGIN START')

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('AUTH RESULT', authData)
      console.log('AUTH ERROR', authError)

      if (authError) {
        console.error('Auth error:', authError)
        showToast(authError.message, 'error')
        return
      }

      if (!authData.user) {
        console.error('No user in auth data')
        showToast('Authentication failed', 'error')
        return
      }

      console.log('USER', authData.user)

      const userId = authData.user.id
      console.log('FETCH PROFILE')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single<Profile>()

      console.log('PROFILE', profileData)
      console.log('PROFILE ERROR', profileError)

      if (profileError) {
        console.error('Profile error:', profileError)
        showToast('Failed to fetch user profile', 'error')
        return
      }

      console.log('ROLE', profileData?.role)
      console.log('REDIRECTING...')

      // Redirect based on role
      if (profileData?.role === 'teacher') {
        console.log('Redirecting to /dashboard-guru')
        router.replace('/dashboard-guru')
      } else {
        console.log('Redirecting to /dashboard-mahasiswa')
        router.replace('/dashboard-mahasiswa')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      showToast('An unexpected error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ScientificBackground />
      
      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 gap-0">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg text-center"
          >
            {/* Shield Icon */}
            <motion.div 
              className="w-32 h-32 mx-auto mb-8 relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-primary/20 to-green-light/10 rounded-full blur-2xl" />
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center shadow-2xl">
                <Shield className="w-16 h-16 text-white" />
                <motion.div 
                  className="absolute -right-4 -top-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Eye className="w-8 h-8 text-white/80" />
                </motion.div>
              </div>
            </motion.div>

            <h1 className="text-4xl font-bold text-carbon mb-4">
              ExamGuard
            </h1>
            <p className="text-lg text-graphite mb-8 leading-relaxed">
              AI-Powered Exam Integrity Monitoring Platform. 
              Ensuring fair assessments with intelligent surveillance.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {['Real-time Monitoring', 'AI Detection', 'Secure Environment'].map((feature, i) => (
                <motion.span 
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-green-200 text-sm text-carbon font-medium shadow-sm"
                >
                  {feature}
                </motion.span>
              ))}
            </div>

            {/* Floating molecules decoration */}
            <div className="mt-12 relative h-40">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-green-primary"
                  style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 2) * 40}%` }}
                  animate={{ y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center shadow-lg mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-carbon">ExamGuard</h1>
            </div>

            {/* Login Card */}
            <div className="glass-card rounded-3xl p-8 lg:p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-carbon mb-2">Welcome Back</h2>
                <p className="text-pewter text-sm">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-carbon mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-modern pl-12"
                      style={{ paddingLeft: '48px' }}
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-carbon mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pewter z-10" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-modern pl-12"
                      style={{ paddingLeft: '48px' }}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-cloud text-green-primary focus:ring-green-primary" />
                    <span className="text-pewter">Remember me</span>
                  </label>
                  <a href="#" className="text-green-primary hover:text-green-secondary font-medium">Forgot password?</a>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
                >
                  {loading ? (
                    <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
                  ) : (
                    <>Sign In<ArrowRight className="w-5 h-5" /></>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-cloud" />
                <span className="text-pewter text-sm">or</span>
                <div className="flex-1 h-px bg-cloud" />
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setRole('student')}
                  whileHover={{ scale: role === 'student' ? 1.02 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  animate={role === 'student' ? { scale: 1.02 } : { scale: 1 }}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    role === 'student'
                      ? 'border-green-primary bg-green-50/70 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                      : 'border-cloud hover:border-green-200 hover:bg-green-50/30'
                  }`}
                >
                  <GraduationCap className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                    role === 'student' ? 'text-green-primary' : 'text-pewter'
                  }`} />
                  <span className={`text-sm font-medium transition-colors ${
                    role === 'student' ? 'text-green-primary' : 'text-carbon'
                  }`}>Student</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setRole('teacher')}
                  whileHover={{ scale: role === 'teacher' ? 1.02 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  animate={role === 'teacher' ? { scale: 1.02 } : { scale: 1 }}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    role === 'teacher'
                      ? 'border-green-primary bg-green-50/70 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                      : 'border-cloud hover:border-green-200 hover:bg-green-50/30'
                  }`}
                >
                  <Shield className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                    role === 'teacher' ? 'text-green-primary' : 'text-pewter'
                  }`} />
                  <span className={`text-sm font-medium transition-colors ${
                    role === 'teacher' ? 'text-green-primary' : 'text-carbon'
                  }`}>Teacher</span>
                </motion.button>
              </div>

              {/* Sign up link */}
              <p className="text-center text-sm text-pewter mt-6">
                {`Don't have an account?`}{' '}<a href="/signup" className="text-green-primary font-medium hover:text-green-secondary">Sign up</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
