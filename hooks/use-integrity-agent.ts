'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type EventType = 'tab_switch' | 'mouse_leave' | 'copy_paste' | 'visibility_hidden'

interface IntegrityAgentOptions {
  sessionId: string
  questionNumber: number
  onWarning: (duration: number, questionNumber: number) => void
}

export function useIntegrityAgent({ sessionId, questionNumber, onWarning }: IntegrityAgentOptions) {
  const supabase = createClient()
  
  // Track when document becomes hidden
  const hiddenTimestampRef = useRef<number | null>(null)
  
  // Track processed events to prevent duplicates
  const processedEventsRef = useRef<Set<string>>(new Set())
  
  // Debounce ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const logEvent = useCallback(async (
    eventType: EventType,
    details?: Record<string, unknown>,
    durationSeconds?: number
  ) => {
    // Create unique event key to prevent duplicates
    const eventKey = `${eventType}-${questionNumber}-${Date.now()}`
    
    // Check if this event was already processed (within 1 second window)
    if (processedEventsRef.current.has(eventKey)) {
      return
    }
    
    // Mark event as processed
    processedEventsRef.current.add(eventKey)
    
    // Clean up old events from set (older than 5 seconds)
    setTimeout(() => {
      processedEventsRef.current.delete(eventKey)
    }, 5000)

    // Debounce to avoid flooding
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      try {
        await supabase.from('cheating_events').insert({
          session_id: sessionId,
          event_type: eventType,
          question_number: questionNumber,
          duration_seconds: durationSeconds || null,
          details: details || null,
        } as never)
      } catch (err) {
        console.error('Failed to log integrity event:', err)
      }
    }, 100)
  }, [sessionId, questionNumber, supabase])

  useEffect(() => {
    // Visibility change detection with duration tracking
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Document became hidden - store timestamp
        hiddenTimestampRef.current = Date.now()
        
        logEvent('visibility_hidden', {
          timestamp: new Date().toISOString(),
          action: 'hidden',
        })
      } else {
        // Document became visible - calculate duration
        if (hiddenTimestampRef.current !== null) {
          const durationMs = Date.now() - hiddenTimestampRef.current
          const durationSeconds = Math.floor(durationMs / 1000)
          
          // Only create cheating event if duration >= 5 seconds
          if (durationSeconds >= 5) {
            logEvent('visibility_hidden', {
              timestamp: new Date().toISOString(),
              action: 'visible_after_leave',
            }, durationSeconds)
            
            // Trigger warning modal
            onWarning(durationSeconds, questionNumber)
          }
          
          // Reset timestamp
          hiddenTimestampRef.current = null
        }
      }
    }

    // Tab switch detection (focus/blur)
    const handleFocus = () => {
      logEvent('tab_switch', {
        timestamp: new Date().toISOString(),
        action: 'focused',
      })
    }

    const handleBlur = () => {
      logEvent('tab_switch', {
        timestamp: new Date().toISOString(),
        action: 'blurred',
      })
    }

    // Mouse leave detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        logEvent('mouse_leave', {
          timestamp: new Date().toISOString(),
          target: 'top',
        })
      }
    }

    // Copy/paste detection
    const handleCopy = () => {
      logEvent('copy_paste', {
        timestamp: new Date().toISOString(),
        action: 'copy',
      })
    }

    const handlePaste = () => {
      logEvent('copy_paste', {
        timestamp: new Date().toISOString(),
        action: 'paste',
      })
    }

    const handleCut = () => {
      logEvent('copy_paste', {
        timestamp: new Date().toISOString(),
        action: 'cut',
      })
    }

    // Keyboard shortcuts prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'v', 'x', 'a', 'p', 's', 'f', 'u'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault()
      }
      
      // Prevent F12 dev tools
      if (e.key === 'F12') {
        e.preventDefault()
      }
      
      // Prevent Ctrl+Shift+I (dev tools)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key === 'I'
      ) {
        e.preventDefault()
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('cut', handleCut)
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('cut', handleCut)
      document.removeEventListener('keydown', handleKeyDown)
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [logEvent, questionNumber, onWarning])
}