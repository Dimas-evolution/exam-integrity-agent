'use client'

import { motion } from 'framer-motion'
import { Clock, Eye, CheckCircle, Circle, AlertTriangle } from 'lucide-react'

interface Props {
  examName: string
  currentQuestion: number
  totalQuestions: number
  timeRemaining: string
  integrityStatus: 'secure' | 'warning' | 'violation'
  onAnswerSelect: (answer: string) => void
  selectedAnswer?: string
  questions: { id: number; text: string; options: string[] }[]
}

export function FocusExamWorkspace({
  examName,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  integrityStatus,
  onAnswerSelect,
  selectedAnswer,
  questions,
}: Props) {
  const statusConfig = {
    secure: { color: 'bg-green-100 text-green-700 border-green-200', icon: Eye, label: 'Monitoring Active' },
    warning: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'Attention Required' },
    violation: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'Integrity Violation' },
  }
  const status = statusConfig[integrityStatus]
  const StatusIcon = status.icon
  const question = questions[currentQuestion - 1]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-carbon">{examName}</h1>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${status.color}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{status.label}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2">
              <Clock className="w-5 h-5 text-pewter" />
              <span className="font-mono text-carbon font-medium">{timeRemaining}</span>
            </div>
            
            {/* Progress */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-pewter">Question</span>
              <span className="font-semibold text-carbon">{currentQuestion}/{totalQuestions}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              className="h-full progress-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          {/* Question Dots */}
          <div className="flex justify-between mt-3">
            {questions.map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.2 }}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  i + 1 === currentQuestion
                    ? 'bg-green-primary ring-4 ring-green-primary/20'
                    : i + 1 < currentQuestion
                    ? 'bg-green-primary'
                    : 'bg-cloud'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl p-8 lg:p-10"
        >
          <div className="mb-8">
            <span className="text-sm font-medium text-green-primary">Question {currentQuestion}</span>
            <h2 className="text-2xl font-medium text-carbon mt-2 leading-relaxed">
              {question?.text}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {question?.options.map((option, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onAnswerSelect(option)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                  selectedAnswer === option
                    ? 'border-green-primary bg-green-50'
                    : 'border-cloud hover:border-green-200 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${
                  selectedAnswer === option
                    ? 'bg-green-primary text-white'
                    : 'bg-surface-2 text-pewter'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1 text-carbon">{option}</span>
                {selectedAnswer === option ? (
                  <CheckCircle className="w-6 h-6 text-green-primary" />
                ) : (
                  <Circle className="w-6 h-6 text-cloud" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={currentQuestion === 1}
            className="px-6 py-3 rounded-xl border border-cloud text-pewter hover:bg-surface-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </motion.button>
          
          <span className="text-sm text-pewter">
            {Math.round((currentQuestion / totalQuestions) * 100)}% Complete
          </span>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary px-6 py-3"
          >
            {currentQuestion === totalQuestions ? 'Submit Exam' : 'Next Question'}
          </motion.button>
        </div>
      </main>
    </div>
  )
}