import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up - Exam Integrity',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <div className="w-full max-w-[330px] px-4">
        <h1 className="text-carbon text-[34px] font-medium leading-[1.2] mb-8 text-center tracking-tight">
          Sign Up
        </h1>
        <SignupForm />
      </div>
    </div>
  )
}