export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'teacher' | 'student'
          name: string
          created_at: string
        }
        Insert: {
          id: string
          role: 'teacher' | 'student'
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'teacher' | 'student'
          name?: string
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          title: string
          description: string | null
          teacher_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          teacher_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          teacher_id?: string
          created_at?: string
        }
      }
      exam_sessions: {
        Row: {
          id: string
          exam_id: string
          student_id: string
          current_question_index: number
          status: 'active' | 'submitted'
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          exam_id: string
          student_id: string
          current_question_index?: number
          status?: 'active' | 'submitted'
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          exam_id?: string
          student_id?: string
          current_question_index?: number
          status?: 'active' | 'submitted'
          started_at?: string
          completed_at?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          exam_id: string
          question_text: string
          question_order: number
          question_type: 'multiple_choice' | 'essay'
          options: Json | null
          correct_answer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          question_text: string
          question_order?: number
          question_type?: 'multiple_choice' | 'essay'
          options?: Json | null
          correct_answer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          question_text?: string
          question_order?: number
          question_type?: 'multiple_choice' | 'essay'
          options?: Json | null
          correct_answer?: string | null
          created_at?: string
        }
      }
      student_answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          answer: string
          answered_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          answer: string
          answered_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          answer?: string
          answered_at?: string
        }
      }
      cheating_events: {
        Row: {
          id: string
          session_id: string
          event_type: 'tab_switch' | 'mouse_leave' | 'copy_paste' | 'visibility_hidden'
          question_number: number | null
          duration_seconds: number | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          event_type: 'tab_switch' | 'mouse_leave' | 'copy_paste' | 'visibility_hidden'
          question_number?: number | null
          duration_seconds?: number | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          event_type?: 'tab_switch' | 'mouse_leave' | 'copy_paste' | 'visibility_hidden'
          question_number?: number | null
          duration_seconds?: number | null
          details?: Json | null
          created_at?: string
        }
      }
    }
  }
}
