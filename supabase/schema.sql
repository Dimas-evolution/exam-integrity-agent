-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Table: profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: exams
CREATE TABLE exams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES profiles(id) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: questions
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL DEFAULT 1,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'essay')),
    options JSONB,
    correct_answer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: exam_sessions
CREATE TABLE exam_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID REFERENCES exams(id) NOT NULL,
    student_id UUID REFERENCES profiles(id) NOT NULL,
    current_question_index INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'submitted')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(exam_id, student_id)
);

-- Table: student_answers
CREATE TABLE student_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    answer TEXT NOT NULL,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

-- Table: cheating_events
CREATE TABLE cheating_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES exam_sessions(id) NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('tab_switch', 'mouse_leave', 'copy_paste', 'visibility_hidden')),
    question_number INTEGER,
    duration_seconds INTEGER,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (Performance Optimization)
-- ============================================

-- Foreign key indexes for faster joins
CREATE INDEX idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_questions_exam_order ON questions(exam_id, question_order);
CREATE INDEX idx_exam_sessions_exam_id ON exam_sessions(exam_id);
CREATE INDEX idx_exam_sessions_student_id ON exam_sessions(student_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(student_id, status);
CREATE INDEX idx_student_answers_session_id ON student_answers(session_id);
CREATE INDEX idx_student_answers_question_id ON student_answers(question_id);
CREATE INDEX idx_cheating_events_session_id ON cheating_events(session_id);
CREATE INDEX idx_cheating_events_created_at ON cheating_events(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheating_events ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- EXAMS POLICIES
CREATE POLICY "exams_select_all" ON exams FOR SELECT USING (true);
CREATE POLICY "exams_insert_teacher" ON exams FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
        AND teacher_id = auth.uid()
    );
CREATE POLICY "exams_update_teacher" ON exams FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
        AND teacher_id = auth.uid()
    );
CREATE POLICY "exams_delete_teacher" ON exams FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
        AND teacher_id = auth.uid()
    );

-- QUESTIONS POLICIES
CREATE POLICY "questions_select_all" ON questions FOR SELECT USING (true);
CREATE POLICY "questions_insert_teacher" ON questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE id = exam_id AND teacher_id = auth.uid()
        )
    );
CREATE POLICY "questions_update_teacher" ON questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE id = exam_id AND teacher_id = auth.uid()
        )
    );
CREATE POLICY "questions_delete_teacher" ON questions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE id = exam_id AND teacher_id = auth.uid()
        )
    );

-- EXAM_SESSIONS POLICIES
-- Students can read their own sessions
CREATE POLICY "exam_sessions_select_own_or_teacher" ON exam_sessions FOR SELECT
    USING (
        auth.uid() = student_id OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
    );
-- Students can create their own sessions
CREATE POLICY "exam_sessions_insert_own" ON exam_sessions FOR INSERT
    WITH CHECK (auth.uid() = student_id);
-- Students can update their own sessions (only current_question_index and status)
CREATE POLICY "exam_sessions_update_own" ON exam_sessions FOR UPDATE
    USING (auth.uid() = student_id);

-- STUDENT_ANSWERS POLICIES
-- Students can read their own answers, teachers can read all
CREATE POLICY "student_answers_select_own_or_teacher" ON student_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE id = session_id AND student_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
    );
-- Students can insert their own answers (only for active sessions they own)
CREATE POLICY "student_answers_insert_own" ON student_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE id = session_id 
            AND student_id = auth.uid() 
            AND status = 'active'
        )
    );
-- Students can update their own answers (only for active sessions they own)
CREATE POLICY "student_answers_update_own" ON student_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE id = session_id 
            AND student_id = auth.uid() 
            AND status = 'active'
        )
    );
-- Students can delete their own answers
CREATE POLICY "student_answers_delete_own" ON student_answers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE id = session_id AND student_id = auth.uid()
        )
    );

-- CHEATING_EVENTS POLICIES
-- Teachers can read all cheating events
CREATE POLICY "cheating_events_select_teacher" ON cheating_events FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));
-- Students can insert cheating events for their active session
CREATE POLICY "cheating_events_insert_own" ON cheating_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exam_sessions 
            WHERE id = session_id 
            AND student_id = auth.uid() 
            AND status = 'active'
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Handle new user signup and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- REALTIME PUBLICATIONS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE cheating_events;
ALTER PUBLICATION supabase_realtime ADD TABLE exam_sessions;
-- Note: student_answers realtime is optional - only if teacher needs real-time monitoring
-- ALTER PUBLICATION supabase_realtime ADD TABLE student_answers;