'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const [role, setRole] = React.useState<'student' | 'teacher'>('student')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        // If no session, it means email confirmation is required
        if (!data.session) {
          setError('Akun berhasil dibuat! Silakan cek kotak masuk Email Anda untuk verifikasi sebelum bisa login.')
          return
        }

        // Redirect based on role if session exists (auto login)
        const redirectUrl = role === 'teacher' ? '/dashboard-guru' : '/dashboard-mahasiswa'
        router.push(redirectUrl)
      }
    } catch  {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className={`text-[14px] py-2 px-3 rounded ${error.includes('berhasil') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'text-[#D9534F]'}`}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-[14px] text-carbon mb-1.5">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full h-10 px-3 border border-cloud rounded text-[14px] text-carbon placeholder:text-pewter focus:outline-none focus:border-cloud focus:ring-1 focus:ring-cloud transition-colors duration-330"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-[14px] text-carbon mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-10 px-3 border border-cloud rounded text-[14px] text-carbon placeholder:text-pewter focus:outline-none focus:border-cloud focus:ring-1 focus:ring-cloud transition-colors duration-330"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-[14px] text-carbon mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full h-10 px-3 border border-cloud rounded text-[14px] text-carbon placeholder:text-pewter focus:outline-none focus:border-cloud focus:ring-1 focus:ring-cloud transition-colors duration-330"
          placeholder="Minimum 6 characters"
        />
      </div>

      <div>
        <label className="block text-[14px] text-carbon mb-1.5">
          Role
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={() => setRole('student')}
              className="w-4 h-4 text-cloud border-cloud focus:ring-cloud"
            />
            <span className="text-[14px] text-carbon">Student</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === 'teacher'}
              onChange={() => setRole('teacher')}
              className="w-4 h-4 text-cloud border-cloud focus:ring-cloud"
            />
            <span className="text-[14px] text-carbon">Teacher</span>
          </label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-carbon text-white text-[14px] font-medium rounded hover:bg-graphite transition-colors duration-330 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>

      <p className="text-[14px] text-graphite text-center mt-4">
        Already have an account?{' '}
        <a href="/login" className="text-carbon hover:underline">
          Sign In
        </a>
      </p>
    </form>
  )
}