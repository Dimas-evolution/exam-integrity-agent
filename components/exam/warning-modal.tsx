'use client'

import * as React from 'react'

interface WarningModalProps {
  isVisible: boolean
  duration: number
  questionNumber: number
  onAcknowledge: () => void
}

export function WarningModal({ isVisible, duration, questionNumber, onAcknowledge }: WarningModalProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fullscreen overlay - blocks all interactions */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Modal content */}
      <div className="relative z-10 bg-white rounded-[4px] p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h2 className="text-[28px] font-medium text-carbon tracking-tight mb-4">
            PERINGATAN
          </h2>
          
          <p className="text-[16px] text-graphite leading-relaxed">
            Anda terdeteksi meninggalkan halaman ujian selama{' '}
            <span className="font-medium text-red-600">{duration}</span>{' '}
            detik.
          </p>
          
          <p className="text-[16px] text-graphite leading-relaxed mt-4">
            Aktivitas pada Soal Nomor{' '}
            <span className="font-medium text-red-600">{questionNumber}</span>{' '}
            telah dicatat dan dilaporkan kepada dosen.
          </p>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAcknowledge()
          }}
          disabled={false}
          className="w-full py-3 px-6 bg-[#3E6AE1] text-white text-[14px] font-medium rounded-[4px] hover:bg-[#3558c9] transition-colors duration-330"
        >
          Saya Mengerti dan Akan Jujur
        </button>
      </div>
    </div>
  )
}