'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Menu,
  X,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react'

type Profile = {
  id: string
  role: 'teacher' | 'student'
  name: string
  email?: string
}

interface NavbarProps {
  profile?: Profile | null
}

export function Navbar({ profile: initialProfile }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [profile, setProfile] = React.useState<Profile | null>(initialProfile || null)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const profileRef = React.useRef<HTMLDivElement>(null)

  // Fetch profile on mount
  React.useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data as Profile)
      }
    }
    if (!initialProfile) getProfile()
  }, [supabase, initialProfile])

  // Scroll handler
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close profile dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isTeacher = profile?.role === 'teacher'

  return (
    <>
      <nav
        className={`
          sticky top-0 z-50 w-full transition-all duration-300
          ${isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm'
            : 'bg-white'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Always visible */}
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-semibold text-carbon tracking-tight no-underline"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center flex-shrink-0">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="whitespace-nowrap">ExamGuard</span>
            </Link>

            {/* Desktop Right Side - Profile Dropdown Only */}
            <div className="hidden lg:flex items-center gap-3">
              {profile && (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {profile.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-carbon max-w-[120px] truncate">
                      {profile.name}
                    </span>
                    <svg className="w-4 h-4 text-pewter flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-cloud overflow-hidden z-50"
                      >
                        {/* User Info */}
                        <div className="px-4 py-4 border-b border-cloud">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                              {profile.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-carbon truncate">{profile.name}</p>
                              <p className="text-xs text-pewter truncate">{profile.email || 'user@email.com'}</p>
                              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                isTeacher ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {isTeacher ? 'Teacher' : 'Student'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-carbon hover:bg-surface transition-colors no-underline"
                          >
                            <Settings className="w-4 h-4 text-pewter" />
                            Settings
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-cloud py-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-2 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-carbon" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-carbon" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-cloud">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-carbon">ExamGuard</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-carbon" />
                  </button>
                </div>

                {/* Profile Card */}
                {profile && (
                  <div className="p-4 border-b border-cloud">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                        {profile.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-carbon truncate">{profile.name}</p>
                        <p className="text-xs text-pewter truncate">{profile.email || 'user@email.com'}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          isTeacher ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isTeacher ? 'Teacher' : 'Student'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation - Settings Only */}
                <nav className="flex-1 overflow-y-auto py-2">
                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 mx-2 px-4 py-3 text-sm font-medium text-carbon rounded-lg hover:bg-surface-2 transition-colors no-underline"
                  >
                    <Settings className="w-5 h-5 text-pewter" />
                    Settings
                  </Link>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-cloud">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-danger bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}