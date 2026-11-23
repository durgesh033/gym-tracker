'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { useAuth } from '@lib/auth';
import {
  Routine,
  RoutineDay,
  RoutineExercise,
  Exercise,
  RoutineWithDays,
  SplitConfig,
  SPLIT_CONFIGS,
} from '@types/routine';

// ============================================================================
// Query Keys
// ============================================================================
export const routineKeys = {
  all: ['routines'] as const,
  active: () => [...routineKeys.all, 'active'] as const,
  detail: (id: string) => [...routineKeys.all, 'detail', id] as const,
  days: (routineId: string) => [...routineKeys.all, 'days', routineId] as const,
  exercises: (dayId: string) => [...routineKeys.all, 'exercises', dayId] as const,
  exerciseLibrary: (muscleGroup?: string) => [...routineKeys.all, 'library', muscleGroup] as const,
};

// ============================================================================
// Helpers
// ============================================================================
async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// ============================================================================
// Queries
// ============================================================================
export function useActiveRoutine() {
  const { user } = useAuth();
  return useQuery({
    queryKey: routineKeys.active(),
    queryFn: async () => {
      const userId = user?.id || await getUserId();
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data as Routine | null;
    },
    enabled: !!user,
  });
}

export function useRoutineWithDays(routineId: string | undefined) {
  return useQuery({
    queryKey: routineKeys.detail(routineId || ''),
    queryFn: async () => {
      if (!routineId) return null;

      // Fetch routine
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();

      if (routineError) throw routineError;

      // Fetch days with exercises
      const { data: days, error: daysError } = await supabase
        .from('routine_days')
        .select(`
          *,
          routine_exercises (
            *,
            exercises (*)
          )
        `)
        .eq('routine_id', routineId)
        .order('day_order');

      if (daysError) throw daysError;

      const daysWithExercises = (days || []).map(day => ({
        ...day,
        exercises: (day.routine_exercises || [])
          .sort((a, b) => a.exercise_order - b.exercise_order)
          .map(re => ({
            ...re,
            exercise: re.exercises,
          })),
      }));

      return { ...routine, days: daysWithExercises } as RoutineWithDays;
    },
    enabled: !!routineId,
  });
}

export function useRoutineDays(routineId: string | undefined) {
  return useQuery({
    queryKey: routineKeys.days(routineId || ''),
    queryFn: async () => {
      if (!routineId) return [];
      const { data, error } = await supabase
        .from('routine_days')
        .select('*')
        .eq('routine_id', routineId)
        .order('day_order');
      if (error) throw error;
      return data as RoutineDay[];
    },
    enabled: !!routineId,
  });
}

export function useRoutineDayExercises(dayId: string | undefined) {
  return useQuery({
    queryKey: routineKeys.exercises(dayId || ''),
    queryFn: async () => {
      if (!dayId) return [];
      const { data, error } = await supabase
        .from('routine_exercises')
        .select(`
          *,
          exercises (*)
        `)
        .eq('routine_day_id', dayId)
        .order('exercise_order');
      if (error) throw error;
      return data as (RoutineExercise & { exercises: Exercise })[];
    },
    enabled: !!dayId,
  });
}

export function useExerciseLibrary(muscleGroup?: string) {
  return useQuery({
    queryKey: routineKeys.exerciseLibrary(muscleGroup),
    queryFn: async () => {
      let query = supabase
        .from('exercises')
        .select('*')
        .eq('is_builtin', true)
        .order('muscle_group')
        .order('name');

      if (muscleGroup) {
        query = query.eq('muscle_group', muscleGroup);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Exercise[];
    },
  });
}

export function useSplitConfigs() {
  return SPLIT_CONFIGS;
}

// ============================================================================
// Mutations
// ============================================================================
export function useCreateRoutine() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (routine: Omit<Routine, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const userId = user?.id || await getUserId();
      const { data, error } = await supabase
        .from('routines')
        .insert({ ...routine, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data as Routine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.active() });
    },
  });
}

export function useCreateRoutineFromSplit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const createRoutine = useCreateRoutine();

  return useMutation({
    mutationFn: async (splitConfig: SplitConfig) => {
      const userId = user?.id || await getUserId();

      // Deactivate existing routines
      await supabase
        .from('routines')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Create new routine
      const routine = await createRoutine.mutateAsync({
        name: splitConfig.name,
        split_type: splitConfig.type,
        days_per_week: splitConfig.daysPerWeek,
        rest_days: splitConfig.restDays,
        is_active: true,
      });

      // Create routine days
      const days = splitConfig.defaultDays.map(d => ({
        routine_id: routine.id,
        name: d.name,
        day_order: d.order,
      }));

      const { error: daysError } = await supabase
        .from('routine_days')
        .insert(days);
      if (daysError) throw daysError;

      return routine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.active() });
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Routine> & { id: string }) => {
      const { data, error } = await supabase
        .from('routines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Routine;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.active() });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(data.id) });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.active() });
    },
  });
}

export function useCreateRoutineDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (day: Omit<RoutineDay, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('routine_days')
        .insert(day)
        .select()
        .single();
      if (error) throw error;
      return data as RoutineDay;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.days(data.routine_id) });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(data.routine_id) });
    },
  });
}

export function useUpdateRoutineDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RoutineDay> & { id: string }) => {
      const { data, error } = await supabase
        .from('routine_days')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as RoutineDay;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.days(data.routine_id) });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(data.routine_id) });
    },
  });
}

export function useDeleteRoutineDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, routineId }: { id: string; routineId: string }) => {
      const { error } = await supabase.from('routine_days').delete().eq('id', id);
      if (error) throw error;
      return routineId;
    },
    onSuccess: (routineId) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.days(routineId) });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(routineId) });
    },
  });
}

export function useReorderRoutineDays() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ routineId, dayOrders }: { routineId: string; dayOrders: { id: string; day_order: number }[] }) => {
      for (const { id, day_order } of dayOrders) {
        const { error } = await supabase
          .from('routine_days')
          .update({ day_order })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.days(variables.routineId) });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(variables.routineId) });
    },
  });
}

export function useAddExerciseToDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exercise: Omit<RoutineExercise, 'id' | 'created_at'>) => {
      // Get max exercise_order for this day
      const { data: maxOrder } = await supabase
        .from('routine_exercises')
        .select('exercise_order')
        .eq('routine_day_id', exercise.routine_day_id)
        .order('exercise_order', { ascending: false })
        .limit(1);

      const nextOrder = (maxOrder?.[0]?.exercise_order ?? -1) + 1;

      const { data, error } = await supabase
        .from('routine_exercises')
        .insert({ ...exercise, exercise_order: nextOrder })
        .select(`
          *,
          exercises (*)
        `)
        .single();
      if (error) throw error;
      return data as RoutineExercise & { exercises: Exercise };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.exercises(data.routine_day_id) });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(data.routine_day_id) });
    },
  });
}

export function useUpdateRoutineExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RoutineExercise> & { id: string }) => {
      const { data, error } = await supabase
        .from('routine_exercises')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          exercises (*)
        `)
        .single();
      if (error) throw error;
      return data as RoutineExercise & { exercises: Exercise };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.exercises(data.routine_day_id) });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(data.routine_day_id) });
    },
  });
}

export function useDeleteRoutineExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, routineDayId }: { id: string; routineDayId: string }) => {
      const { error } = await supabase.from('routine_exercises').delete().eq('id', id);
      if (error) throw error;
      return routineDayId;
    },
    onSuccess: (routineDayId) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.exercises(routineDayId) });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(routineDayId) });
    },
  });
}

export function useReorderRoutineExercises() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ routineDayId, exerciseOrders }: { routineDayId: string; exerciseOrders: { id: string; exercise_order: number }[] }) => {
      for (const { id, exercise_order } of exerciseOrders) {
        const { error } = await supabase
          .from('routine_exercises')
          .update({ exercise_order })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.exercises(variables.routineDayId) });
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(variables.routineDayId) });
    },
  });
}

export function useCreateCustomExercise() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (exercise: Omit<Exercise, 'id' | 'user_id' | 'is_builtin' | 'created_at'>) => {
      const userId = user?.id || await getUserId();
      const { data, error } = await supabase
        .from('exercises')
        .insert({ ...exercise, user_id: userId, is_builtin: false })
        .select()
        .single();
      if (error) throw error;
      return data as Exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.exerciseLibrary() });
    },
  });
}