-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users) - Supabase creates auth.users automatically
-- We create a profiles table that references auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- User preferences
  weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  -- Progression settings
  progression_scheme TEXT DEFAULT 'double_progression' CHECK (progression_scheme IN ('double_progression', 'linear', 'rpe')),
  deload_threshold_sessions INTEGER DEFAULT 4
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Routines (user's workout program)
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  split_type TEXT NOT NULL, -- 'ppl', 'upper_lower', 'full_body', 'custom'
  days_per_week INTEGER NOT NULL,
  rest_days JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of day indices (0=Monday)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own routines" ON public.routines
  FOR ALL USING (auth.uid() = user_id);

-- Routine days (Push, Pull, Legs, etc.)
CREATE TABLE public.routine_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Push', 'Pull', 'Legs'
  day_order INTEGER NOT NULL, -- 0, 1, 2, 3...
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.routine_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own routine days" ON public.routine_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_id AND r.user_id = auth.uid()
    )
  );

-- Exercise library (built-in + custom)
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL = built-in
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL, -- 'chest', 'back', 'quads', 'hamstrings', 'shoulders', 'biceps', 'triceps', 'glutes', 'calves', 'abs', 'forearms'
  movement_pattern TEXT, -- 'horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'knee_dominant', 'hip_dominant', 'carry', 'core'
  equipment TEXT, -- 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band'
  is_builtin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all built-in exercises" ON public.exercises
  FOR SELECT USING (is_builtin = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can CRUD own custom exercises" ON public.exercises
  FOR ALL USING (user_id = auth.uid());

-- Routine exercises (exercises assigned to a routine day with set/rep config)
CREATE TABLE public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_day_id UUID NOT NULL REFERENCES public.routine_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  exercise_order INTEGER NOT NULL,
  sets_target INTEGER NOT NULL DEFAULT 3,
  reps_min INTEGER NOT NULL DEFAULT 8,
  reps_max INTEGER NOT NULL DEFAULT 12,
  rest_seconds INTEGER DEFAULT 120,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own routine exercises" ON public.routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.routine_days rd
      JOIN public.routines r ON r.id = rd.routine_id
      WHERE rd.id = routine_day_id AND r.user_id = auth.uid()
    )
  );

-- Workout sessions (actual workouts performed)
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  routine_day_id UUID REFERENCES public.routine_days(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own workout sessions" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Workout sets (individual sets within a session)
CREATE TABLE public.workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  routine_exercise_id UUID REFERENCES public.routine_exercises(id) ON DELETE SET NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL, -- in kg (always stored in kg)
  reps INTEGER NOT NULL,
  rpe DECIMAL(3,1), -- Rate of Perceived Exertion (optional)
  is_warmup BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own workout sets" ON public.workout_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.user_id = auth.uid()
    )
  );

-- Indexes for common queries
CREATE INDEX idx_workout_sessions_user_date ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX idx_workout_sets_session ON public.workout_sets(session_id);
CREATE INDEX idx_workout_sets_exercise_user ON public.workout_sets(exercise_id, created_at DESC);
CREATE INDEX idx_routine_exercises_day ON public.routine_exercises(routine_day_id, exercise_order);
CREATE INDEX idx_exercises_muscle ON public.exercises(muscle_group);

-- Function to get next workout day for user
CREATE OR REPLACE FUNCTION public.get_next_workout_day(p_user_id UUID)
RETURNS TABLE (
  routine_id UUID,
  routine_name TEXT,
  day_id UUID,
  day_name TEXT,
  day_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH active_routine AS (
    SELECT id, name, split_type, days_per_week, rest_days
    FROM public.routines
    WHERE user_id = p_user_id AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1
  ),
  routine_days AS (
    SELECT id, routine_id, name, day_order
    FROM public.routine_days
    WHERE routine_id = (SELECT id FROM active_routine)
    ORDER BY day_order
  ),
  last_session AS (
    SELECT routine_day_id, started_at
    FROM public.workout_sessions
    WHERE user_id = p_user_id
    ORDER BY started_at DESC
    LIMIT 1
  ),
  next_day AS (
    SELECT rd.*
    FROM routine_days rd
    CROSS JOIN active_routine ar
    CROSS JOIN LATERAL (
      SELECT COALESCE((
        SELECT day_order + 1
        FROM routine_days rd2
        WHERE rd2.routine_id = ar.id AND rd2.day_order > (
          SELECT COALESCE(rd3.day_order, -1)
          FROM routine_days rd3
          WHERE rd3.id = (SELECT routine_day_id FROM last_session)
        )
        ORDER BY rd2.day_order
        LIMIT 1
      ), 0) AS next_order
    ) n
    WHERE rd.routine_id = ar.id AND rd.day_order = n.next_order
  )
  SELECT
    ar.id AS routine_id,
    ar.name AS routine_name,
    nd.id AS day_id,
    nd.name AS day_name,
    nd.day_order
  FROM active_routine ar
  JOIN next_day nd ON TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get last sets for an exercise (for prefill)
CREATE OR REPLACE FUNCTION public.get_last_sets_for_exercise(p_user_id UUID, p_exercise_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  session_id UUID,
  session_date TIMESTAMPTZ,
  set_number INTEGER,
  weight DECIMAL(6,2),
  reps INTEGER,
  rpe DECIMAL(3,1),
  is_warmup BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ws.id AS session_id,
    ws.started_at AS session_date,
    ws_s.set_number,
    ws_s.weight,
    ws_s.reps,
    ws_s.rpe,
    ws_s.is_warmup
  FROM public.workout_sets ws_s
  JOIN public.workout_sessions ws ON ws.id = ws_s.session_id
  WHERE ws.user_id = p_user_id
    AND ws_s.exercise_id = p_exercise_id
    AND ws_s.is_warmup = FALSE
  ORDER BY ws.started_at DESC, ws_s.set_number
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;