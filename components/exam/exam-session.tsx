'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { WarningModal } from './warning-modal'
import { useIntegrityAgent } from '@/hooks/use-integrity-agent'

type Exam = Database['public']['Tables']['exams']['Row']
type Session = Database['public']['Tables']['exam_sessions']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type StudentAnswer = Database['public']['Tables']['student_answers']['Row']

interface QuestionOption {
  letter: string
  text: string
}

export function ExamSession({ exam, session }: { exam: Exam, session: Session }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = React.useState(session.current_question_index || 0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Warning modal state
  const [showWarning, setShowWarning] = React.useState(false)
  const [warningDuration, setWarningDuration] = React.useState(0)
  const [warningQuestion, setWarningQuestion] = React.useState(1)
  
  // Load questions and existing answers
  React.useEffect(() => {
    const loadExamContent = async () => {
      try {
        // Fetch questions ordered by question_order
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('exam_id', exam.id)
          .order('question_order', { ascending: true })
        
        if (questionsError) throw questionsError
        setQuestions(questionsData || [])
        
        // Fetch existing answers for this session
        const { data: answersData, error: answersError } = await supabase
          .from('student_answers')
          .select('*')
          .eq('session_id', session.id)
        
        if (answersError) throw answersError
        
        // Convert answers array to record
        if (answersData && answersData.length > 0) {
          const answersMap: Record<string, string> = {}
          answersData.forEach((answer: StudentAnswer) => {
            answersMap[answer.question_id] = answer.answer
          })
          setAnswers(answersMap)
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load exam content:', err)
        setIsLoading(false)
      }
    }
    
    loadExamContent()
  }, [exam.id, session.id, supabase])
  
  // Update session's current question index when it changes
  React.useEffect(() => {
    const updateQuestionIndex = async () => {
      try {
        await supabase
          .from('exam_sessions')
          .update({ current_question_index: currentIndex } as never)
          .eq('id', session.id)
      } catch (err) {
        console.error('Failed to update question index:', err)
      }
    }
    
    updateQuestionIndex()
  }, [currentIndex, session.id, supabase])
  
  // Warning handler for integrity agent
  const handleWarning = React.useCallback((duration: number, questionNumber: number) => {
    setWarningDuration(duration)
    setWarningQuestion(questionNumber)
    setShowWarning(true)
  }, [])
  
  // Initialize cheating detection agent with warning callback
  useIntegrityAgent({
    sessionId: session.id,
    questionNumber: currentIndex + 1,
    onWarning: handleWarning,
  })
  
  // Handle answer change with auto-save
  const handleAnswerChange = async (questionId: string, answer: string) => {
    // Update local state immediately
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    
    // Auto-save to database (upsert)
    try {
      await supabase
        .from('student_answers')
        .upsert({
          session_id: session.id,
          question_id: questionId,
          answer: answer,
        } as never, {
          onConflict: 'session_id,question_id',
        })
    } catch (err) {
      console.error('Failed to save answer:', err)
    }
  }
  
  // Navigation handlers
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }
  
  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }
  
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
    }
  }
  
  // Submit exam
  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit? You cannot return to the exam once submitted.')) {
      return
    }
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('exam_sessions')
        .update({ status: 'submitted', completed_at: new Date().toISOString() } as never)
        .eq('id', session.id)
      
      if (error) throw error
      
      router.push('/dashboard-mahasiswa')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to submit exam')
      setIsSubmitting(false)
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col max-w-[800px] mx-auto w-full items-center justify-center">
        <p className="text-graphite">Loading exam...</p>
      </div>
    )
  }
  
  // No questions state
  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col max-w-[800px] mx-auto w-full items-center justify-center">
        <p className="text-graphite">No questions available for this exam.</p>
      </div>
    )
  }
  
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const options: QuestionOption[] = (currentQuestion.options as unknown as QuestionOption[]) || []
  const isMultipleChoice = currentQuestion.question_type === 'multiple_choice'
  const currentAnswer = answers[currentQuestion.id] || ''
  
  return (
    <>
      {/* Warning Modal - blocks all interactions when visible */}
      <WarningModal
        isVisible={showWarning}
        duration={warningDuration}
        questionNumber={warningQuestion}
        onAcknowledge={() => setShowWarning(false)}
      />
      
      <div className={`flex-1 flex flex-col max-w-[800px] mx-auto w-full ${showWarning ? 'pointer-events-none select-none' : ''}`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[34px] font-medium text-carbon tracking-tight">{exam.title}</h1>
          {exam.description && (
            <p className="text-[14px] text-graphite mt-2">{exam.description}</p>
          )}
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-6 bg-[#F4F4F4] rounded-[4px] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-graphite font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-[14px] text-graphite font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-[#EEEEEE] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3E6AE1] transition-all duration-330"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Question dots navigation */}
          <div className="flex flex-wrap gap-2 mt-3">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                disabled={showWarning}
                className={`
                  w-8 h-8 rounded text-[12px] font-medium transition-colors duration-330
                  ${idx === currentIndex
                    ? 'bg-[#3E6AE1] text-white'
                    : answers[q.id]
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-[#EEEEEE] text-graphite hover:bg-[#D0D1D2]'
                  }
                  ${showWarning ? 'cursor-not-allowed opacity-50' : ''}
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
        
        {/* Question Content */}
        <div className="flex-1 bg-[#F4F4F4] rounded-[4px] border border-cloud p-6">
          <div className="mb-6">
            <span className="text-[12px] text-graphite uppercase tracking-wide">
              {isMultipleChoice ? 'Multiple Choice' : 'Essay'}
            </span>
            <p className="text-[16px] text-carbon mt-2 leading-relaxed">
              {currentQuestion.question_text}
            </p>
          </div>
          
          {/* Answer Options */}
          {isMultipleChoice && options.length > 0 ? (
            <div className="space-y-3">
              {options.map((option) => (
                <label
                  key={option.letter}
                  className={`
                    flex items-center p-4 rounded-[4px] border cursor-pointer transition-colors duration-330
                    ${currentAnswer === option.letter
                      ? 'border-[#3E6AE1] bg-[#3E6AE1]/5'
                      : 'border-[#EEEEEE] bg-white hover:border-[#D0D1D2]'
                    }
                    ${showWarning ? 'cursor-not-allowed pointer-events-none' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.letter}
                    checked={currentAnswer === option.letter}
                    onChange={() => handleAnswerChange(currentQuestion.id, option.letter)}
                    disabled={showWarning}
                    className="w-4 h-4 text-[#3E6AE1] mr-3"
                  />
                  <span className="text-[14px] font-medium text-carbon mr-2">
                    {option.letter}.
                  </span>
                  <span className="text-[14px] text-graphite">
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            /* Essay Answer */
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              disabled={showWarning}
              placeholder="Write your answer here..."
              className={`
                w-full min-h-[200px] p-4 rounded-[4px] border border-[#EEEEEE] 
                text-[14px] text-carbon bg-white resize-none
                focus:outline-none focus:border-[#3E6AE1] transition-colors duration-330
                ${showWarning ? 'cursor-not-allowed opacity-50' : ''}
              `}
            />
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="mt-6 pt-6 border-t border-cloud flex justify-between">
          <Button
            variant="secondary"
            onClick={goToPrevious}
            disabled={currentIndex === 0 || showWarning}
          >
            Previous
          </Button>
          
          {currentIndex === questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || showWarning}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={goToNext}
              disabled={showWarning}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </>
  )
}