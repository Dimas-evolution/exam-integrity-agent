'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single() as { data: { role: string } | null }

        if (profile?.role === 'teacher') {
          router.push('/dashboard-guru')
        } else {
          router.push('/dashboard-mahasiswa')
        }
        router.refresh()
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to sign in')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full h-[40px] px-4 rounded-[4px] border border-cloud bg-[#F4F4F4] text-carbon text-[14px] placeholder:text-silver focus:outline-none focus:border-brand focus:bg-white transition-colors duration-330"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-[40px] px-4 rounded-[4px] border border-cloud bg-[#F4F4F4] text-carbon text-[14px] placeholder:text-silver focus:outline-none focus:border-brand focus:bg-white transition-colors duration-330"
          />
        </div>
      </div>

      {error && (
        <div className="text-[#D9534F] text-[14px] text-center">{error}</div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      <p className="text-[14px] text-graphite text-center">
        {"Don't have an account?"}{' '}
        <a href="/signup" className="text-carbon hover:underline">
          Sign Up
        </a>
      </p>
    </form>
  )
}