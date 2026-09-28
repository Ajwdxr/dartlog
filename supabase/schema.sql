-- ============================================================
-- DARTLOG SUPABASE SCHEMA
-- Professional Dart Scoring System
-- ============================================================

-- 1. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  initials TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  settings JSONB NOT NULL,
  players JSONB NOT NULL,
  legs JSONB NOT NULL,
  sets JSONB NOT NULL,
  history_timeline JSONB NOT NULL,
  status TEXT NOT NULL,
  winner_player_id TEXT,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for querying matches by start date
CREATE INDEX IF NOT EXISTS idx_matches_start_time ON public.matches(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_matches_winner ON public.matches(winner_player_id);

-- 3. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  settings JSONB NOT NULL,
  player_ids JSONB NOT NULL,
  matches JSONB NOT NULL,
  status TEXT NOT NULL,
  winner_player_id TEXT,
  created_at BIGINT NOT NULL
);

-- 4. PRACTICE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  player_id TEXT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  target TEXT,
  target_history JSONB NOT NULL,
  total_darts INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  successes INTEGER NOT NULL DEFAULT 0,
  started_at BIGINT NOT NULL,
  completed_at BIGINT
);

CREATE INDEX IF NOT EXISTS idx_practice_player ON public.practice_sessions(player_id);

-- 5. ROW LEVEL SECURITY (RLS)
-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated access for tournament setup (or configure with your auth requirements)
CREATE POLICY "Allow public read access" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update" ON public.players FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update tournaments" ON public.tournaments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read practice" ON public.practice_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update practice" ON public.practice_sessions FOR ALL USING (true) WITH CHECK (true);
