export interface Routine {
  id: string;
  user_id: string;
  name: string;
  split_type: 'ppl' | 'upper_lower' | 'full_body' | 'custom';
  days_per_week: number;
  rest_days: number[]; // day indices 0=Monday
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  name: string;
  day_order: number;
  created_at: string;
  exercises?: RoutineExercise[];
}

export interface Exercise {
  id: string;
  user_id: string | null;
  name: string;
  muscle_group: string;
  movement_pattern: string | null;
  equipment: string | null;
  is_builtin: boolean;
  created_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  exercise_order: number;
  sets_target: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  notes: string | null;
  created_at: string;
  exercise?: Exercise;
}

export interface RoutineWithDays extends Routine {
  days: RoutineDay[];
}

export type SplitType = 'ppl' | 'upper_lower' | 'full_body' | 'custom';

export interface SplitConfig {
  type: SplitType;
  name: string;
  description: string;
  daysPerWeek: number;
  defaultDays: { name: string; order: number }[];
  restDays: number[];
}

export const SPLIT_CONFIGS: SplitConfig[] = [
  {
    type: 'ppl',
    name: 'Push / Pull / Legs (6-day)',
    description: 'Classic 6-day split hitting each muscle group twice per week. Best for intermediate+ lifters.',
    daysPerWeek: 6,
    defaultDays: [
      { name: 'Push', order: 0 },
      { name: 'Pull', order: 1 },
      { name: 'Legs', order: 2 },
      { name: 'Push', order: 3 },
      { name: 'Pull', order: 4 },
      { name: 'Legs', order: 5 },
    ],
    restDays: [6], // Sunday
  },
  {
    type: 'ppl',
    name: 'Push / Pull / Legs (3-day)',
    description: '3-day version hitting each muscle group once per week. Good for beginners or busy schedules.',
    daysPerWeek: 3,
    defaultDays: [
      { name: 'Push', order: 0 },
      { name: 'Pull', order: 1 },
      { name: 'Legs', order: 2 },
    ],
    restDays: [], // Flexible rest days
  },
  {
    type: 'upper_lower',
    name: 'Upper / Lower (4-day)',
    description: '4-day split alternating upper and lower body. Balanced frequency and recovery.',
    daysPerWeek: 4,
    defaultDays: [
      { name: 'Upper A', order: 0 },
      { name: 'Lower A', order: 1 },
      { name: 'Upper B', order: 2 },
      { name: 'Lower B', order: 3 },
    ],
    restDays: [],
  },
  {
    type: 'full_body',
    name: 'Full Body (3-day)',
    description: '3-day full body routine. Great for beginners or time-crunched lifters.',
    daysPerWeek: 3,
    defaultDays: [
      { name: 'Full Body A', order: 0 },
      { name: 'Full Body B', order: 1 },
      { name: 'Full Body C', order: 2 },
    ],
    restDays: [],
  },
  {
    type: 'custom',
    name: 'Custom Split',
    description: 'Build your own split from scratch.',
    daysPerWeek: 4,
    defaultDays: [],
    restDays: [],
  },
];

export const MUSCLE_GROUPS = [
  'chest', 'back', 'quads', 'hamstrings', 'glutes',
  'shoulders', 'biceps', 'triceps', 'calves', 'abs', 'forearms'
] as const;

export const MOVEMENT_PATTERNS = [
  'horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull',
  'knee_dominant', 'hip_dominant', 'carry', 'core'
] as const;

export const EQUIPMENT_TYPES = [
  'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band'
] as const;