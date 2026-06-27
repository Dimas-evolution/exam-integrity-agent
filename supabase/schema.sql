


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (id, role, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cheating_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "question_number" integer,
    "duration_seconds" integer,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cheating_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['tab_switch'::"text", 'mouse_leave'::"text", 'copy_paste'::"text", 'visibility_hidden'::"text"])))
);


ALTER TABLE "public"."cheating_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exam_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "exam_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "current_question_index" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "exam_sessions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'submitted'::"text"])))
);


ALTER TABLE "public"."exam_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exams" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "teacher_id" "uuid" NOT NULL,
    "duration_minutes" integer DEFAULT 60,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."exams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['teacher'::"text", 'student'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "exam_id" "uuid" NOT NULL,
    "question_text" "text" NOT NULL,
    "question_order" integer DEFAULT 1 NOT NULL,
    "question_type" "text" DEFAULT 'multiple_choice'::"text" NOT NULL,
    "options" "jsonb",
    "correct_answer" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "questions_question_type_check" CHECK (("question_type" = ANY (ARRAY['multiple_choice'::"text", 'essay'::"text"])))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_answers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "answer" "text" NOT NULL,
    "answered_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."student_answers" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cheating_events"
    ADD CONSTRAINT "cheating_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_sessions"
    ADD CONSTRAINT "exam_sessions_exam_id_student_id_key" UNIQUE ("exam_id", "student_id");



ALTER TABLE ONLY "public"."exam_sessions"
    ADD CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_answers"
    ADD CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_answers"
    ADD CONSTRAINT "student_answers_session_id_question_id_key" UNIQUE ("session_id", "question_id");



CREATE INDEX "idx_cheating_events_created_at" ON "public"."cheating_events" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_cheating_events_session_id" ON "public"."cheating_events" USING "btree" ("session_id");



CREATE INDEX "idx_exam_sessions_exam_id" ON "public"."exam_sessions" USING "btree" ("exam_id");



CREATE INDEX "idx_exam_sessions_status" ON "public"."exam_sessions" USING "btree" ("student_id", "status");



CREATE INDEX "idx_exam_sessions_student_id" ON "public"."exam_sessions" USING "btree" ("student_id");



CREATE INDEX "idx_exams_teacher_id" ON "public"."exams" USING "btree" ("teacher_id");



CREATE INDEX "idx_questions_exam_id" ON "public"."questions" USING "btree" ("exam_id");



CREATE INDEX "idx_questions_exam_order" ON "public"."questions" USING "btree" ("exam_id", "question_order");



CREATE INDEX "idx_student_answers_question_id" ON "public"."student_answers" USING "btree" ("question_id");



CREATE INDEX "idx_student_answers_session_id" ON "public"."student_answers" USING "btree" ("session_id");



ALTER TABLE ONLY "public"."cheating_events"
    ADD CONSTRAINT "cheating_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."exam_sessions"("id");



ALTER TABLE ONLY "public"."exam_sessions"
    ADD CONSTRAINT "exam_sessions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id");



ALTER TABLE ONLY "public"."exam_sessions"
    ADD CONSTRAINT "exam_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_answers"
    ADD CONSTRAINT "student_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_answers"
    ADD CONSTRAINT "student_answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE CASCADE;



ALTER TABLE "public"."cheating_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cheating_events_insert_own" ON "public"."cheating_events" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."exam_sessions"
  WHERE (("exam_sessions"."id" = "cheating_events"."session_id") AND ("exam_sessions"."student_id" = "auth"."uid"()) AND ("exam_sessions"."status" = 'active'::"text")))));



CREATE POLICY "cheating_events_select_teacher" ON "public"."cheating_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text")))));



ALTER TABLE "public"."exam_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exam_sessions_insert_own" ON "public"."exam_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "student_id"));



CREATE POLICY "exam_sessions_select_own_or_teacher" ON "public"."exam_sessions" FOR SELECT USING ((("auth"."uid"() = "student_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text"))))));



CREATE POLICY "exam_sessions_update_own" ON "public"."exam_sessions" FOR UPDATE USING (("auth"."uid"() = "student_id"));



ALTER TABLE "public"."exams" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "exams_delete_teacher" ON "public"."exams" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text")))) AND ("teacher_id" = "auth"."uid"())));



CREATE POLICY "exams_insert_teacher" ON "public"."exams" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text")))) AND ("teacher_id" = "auth"."uid"())));



CREATE POLICY "exams_select_all" ON "public"."exams" FOR SELECT USING (true);



CREATE POLICY "exams_update_teacher" ON "public"."exams" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text")))) AND ("teacher_id" = "auth"."uid"())));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select_all" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "questions_delete_teacher" ON "public"."questions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."exams"
  WHERE (("exams"."id" = "questions"."exam_id") AND ("exams"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "questions_insert_teacher" ON "public"."questions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."exams"
  WHERE (("exams"."id" = "questions"."exam_id") AND ("exams"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "questions_select_all" ON "public"."questions" FOR SELECT USING (true);



CREATE POLICY "questions_update_teacher" ON "public"."questions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."exams"
  WHERE (("exams"."id" = "questions"."exam_id") AND ("exams"."teacher_id" = "auth"."uid"())))));



ALTER TABLE "public"."student_answers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "student_answers_delete_own" ON "public"."student_answers" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."exam_sessions"
  WHERE (("exam_sessions"."id" = "student_answers"."session_id") AND ("exam_sessions"."student_id" = "auth"."uid"())))));



CREATE POLICY "student_answers_insert_own" ON "public"."student_answers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."exam_sessions"
  WHERE (("exam_sessions"."id" = "student_answers"."session_id") AND ("exam_sessions"."student_id" = "auth"."uid"()) AND ("exam_sessions"."status" = 'active'::"text")))));



CREATE POLICY "student_answers_select_own_or_teacher" ON "public"."student_answers" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."exam_sessions"
  WHERE (("exam_sessions"."id" = "student_answers"."session_id") AND ("exam_sessions"."student_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text"))))));



CREATE POLICY "student_answers_update_own" ON "public"."student_answers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."exam_sessions"
  WHERE (("exam_sessions"."id" = "student_answers"."session_id") AND ("exam_sessions"."student_id" = "auth"."uid"()) AND ("exam_sessions"."status" = 'active'::"text")))));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON TABLE "public"."cheating_events" TO "anon";
GRANT ALL ON TABLE "public"."cheating_events" TO "authenticated";
GRANT ALL ON TABLE "public"."cheating_events" TO "service_role";



GRANT ALL ON TABLE "public"."exam_sessions" TO "anon";
GRANT ALL ON TABLE "public"."exam_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."exams" TO "anon";
GRANT ALL ON TABLE "public"."exams" TO "authenticated";
GRANT ALL ON TABLE "public"."exams" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."student_answers" TO "anon";
GRANT ALL ON TABLE "public"."student_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."student_answers" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







