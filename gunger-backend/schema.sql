-- GUNGER Platform - PostgreSQL Schema
-- Run this on your Neon DB

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  xp INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BATCHES (Classrooms)
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(100),
  join_code VARCHAR(10) UNIQUE NOT NULL,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BATCH MEMBERS
CREATE TABLE IF NOT EXISTS batch_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(batch_id, user_id)
);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  allowed_languages TEXT[] NOT NULL DEFAULT ARRAY['javascript','python','php','rust','sql'],
  xp_reward INTEGER NOT NULL DEFAULT 10,
  time_limit INTEGER DEFAULT 5000,
  memory_limit INTEGER DEFAULT 256,
  teacher_id UUID NOT NULL REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEST CASES
CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTESTS
CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  batch_id UUID REFERENCES batches(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTEST QUESTIONS
CREATE TABLE IF NOT EXISTS contest_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  marks INTEGER NOT NULL DEFAULT 10,
  UNIQUE(contest_id, question_id)
);

-- SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  contest_id UUID REFERENCES contests(id),
  code TEXT NOT NULL,
  language VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','wrong_answer','runtime_error','time_limit_exceeded','compile_error')),
  test_results JSONB,
  xp_earned INTEGER DEFAULT 0,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOG (GitHub-style green dots)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  UNIQUE(user_id, activity_date)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question ON submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest ON submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_members_batch ON batch_members(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_members_user ON batch_members(user_id);
