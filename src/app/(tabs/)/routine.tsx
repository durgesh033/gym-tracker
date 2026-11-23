'use client';

import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useActiveRoutine, useCreateRoutineFromSplit, useRoutineDays, useRoutineDayExercises, useCreateRoutineDay, useUpdateRoutineDay, useDeleteRoutineDay, useReorderRoutineDays, useAddExerciseToDay, useUpdateRoutineExercise, useDeleteRoutineExercise, useReorderRoutineExercises } from '@hooks/useRoutines';
import { SplitSelector } from '@components/routine/SplitSelector';
import { DayEditor } from '@components/routine/DayEditor';
import { ExercisePicker } from '@components/routine/ExercisePicker';
import { SetRepConfig } from '@components/routine/SetRepConfig';
import { SplitConfig, RoutineDay, RoutineExercise, Exercise, SPLIT_CONFIGS } from '@types/routine';
import { useState, useCallback, useEffect } from 'react';

type BuilderStep = 'split' | 'days' | 'exercises' | 'sets';

export default function RoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: activeRoutine, isLoading: routineLoading } = useActiveRoutine();
  const createRoutineFromSplit = useCreateRoutineFromSplit();
  const { data: days = [], refetch: refetchDays } = useRoutineDays(activeRoutine?.id);
  const createRoutineDay = useCreateRoutineDay();
  const updateRoutineDay = useUpdateRoutineDay();
  const deleteRoutineDay = useDeleteRoutineDay();
  const reorderRoutineDays = useReorderRoutineDays();
  const addExerciseToDay = useAddExerciseToDay();
  const updateRoutineExercise = useUpdateRoutineExercise();
  const deleteRoutineExercise = useDeleteRoutineExercise();
  const reorderRoutineExercises = useReorderRoutineExercises();

  // State
  const [step, setStep] = useState<BuilderStep>('split');
  const [selectedSplit, setSelectedSplit] = useState<SplitConfig | null>(null);
  const [localDays, setLocalDays] = useState<RoutineDay[]>([]);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [dayExercises, setDayExercises] = useState<(RoutineExercise & { exercise: Exercise })[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch exercises for the currently editing day
  const { data: fetchedDayExercises = [], refetch: refetchDayExercises } = useRoutineDayExercises(editingDayId);

  // Sync local days with server when routine loads
  useEffect(() => {
    if (activeRoutine && days.length > 0) {
      setLocalDays(days);
      // Auto-advance if routine exists
      if (step === 'split') {
        setStep('days');
      }
    }
  }, [activeRoutine, days, step]);

  // Update dayExercises when fetched data changes
  useEffect(() => {
    if (editingDayId) {
      setDayExercises(fetchedDayExercises);
    }
  }, [editingDayId, fetchedDayExercises]);

  // Handlers
  const handleSelectSplit = useCallback(async (split: SplitConfig) => {
    setIsSaving(true);
    try {
      const routine = await createRoutineFromSplit.mutateAsync(split);
      setSelectedSplit(split);
      setLocalDays(split.defaultDays.map((d, i) => ({
        id: `temp-${i}`,
        routine_id: routine.id,
        name: d.name,
        day_order: d.order,
        created_at: new Date().toISOString(),
      })));
      setStep('days');
    } catch (error) {
      Alert.alert('Error', 'Failed to create routine. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [createRoutineFromSplit]);

  const handleCustomSplit = useCallback(() => {
    setSelectedSplit(SPLIT_CONFIGS.find(s => s.type === 'custom')!);
    setLocalDays([]);
    setStep('days');
  }, []);

  const handleSaveDays = useCallback(async () => {
    if (!activeRoutine || localDays.length === 0) return;
    setIsSaving(true);
    try {
      // Create days on server
      for (const day of localDays) {
        if (day.id.startsWith('temp-')) {
          await createRoutineDay.mutateAsync({
            routine_id: activeRoutine.id,
            name: day.name,
            day_order: day.day_order,
          });
        } else {
          await updateRoutineDay.mutateAsync({ id: day.id, name: day.name, day_order: day.day_order });
        }
      }
      // Refetch to get server IDs
      await refetchDays();
      setStep('days'); // Stay on days, user can edit more
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout days. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [activeRoutine, localDays, createRoutineDay, updateRoutineDay, refetchDays]);

  const handleCancelDays = useCallback(() => {
    if (activeRoutine) {
      // Reset to server state
      setLocalDays(days);
    } else {
      // Go back to split selection
      setStep('split');
      setSelectedSplit(null);
      setLocalDays([]);
    }
  }, [activeRoutine, days]);

  const handleEditDayExercises = useCallback((day: RoutineDay) => {
    setEditingDayId(day.id);
    setStep('exercises');
  }, []);

  const handleBackFromExercises = useCallback(() => {
    setEditingDayId(null);
    setDayExercises([]);
    setStep('days');
  }, []);

  const handleExerciseAdded = useCallback(async (exercise: Exercise, sets: number, repsMin: number, repsMax: number, restSeconds: number) => {
    if (!editingDayId || sets === 0) {
      // sets === 0 means remove (from clear all)
      return;
    }
    try {
      await addExerciseToDay.mutateAsync({
        routine_day_id: editingDayId,
        exercise_id: exercise.id,
        sets_target: sets,
        reps_min: repsMin,
        reps_max: repsMax,
        rest_seconds: restSeconds,
        notes: null,
      });
      // Refetch will update dayExercises via the component
    } catch (error) {
      Alert.alert('Error', 'Failed to add exercise. Please try again.');
    }
  }, [editingDayId, addExerciseToDay]);

  const handleExerciseUpdated = useCallback(async (id: string, updates: Partial<RoutineExercise>) => {
    try {
      await updateRoutineExercise.mutateAsync({ id, ...updates });
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise. Please try again.');
    }
  }, [updateRoutineExercise]);

  const handleExerciseDeleted = useCallback(async (id: string) => {
    try {
      await deleteRoutineExercise.mutateAsync({ id, routineDayId: editingDayId! });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete exercise. Please try again.');
    }
  }, [editingDayId, deleteRoutineExercise]);

  const handleExercisesReordered = useCallback(async (exerciseOrders: { id: string; exercise_order: number }[]) => {
    try {
      await reorderRoutineExercises.mutateAsync({ routineDayId: editingDayId!, exerciseOrders });
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder exercises. Please try again.');
    }
  }, [editingDayId, reorderRoutineExercises]);

  const handleBackFromSets = useCallback(() => {
    setStep('exercises');
  }, []);

  const handleFinishRoutine = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  // Determine what to render based on step
  const showSplitSelector = step === 'split';
  const showDayEditor = step === 'days';
  const showExercisePicker = step === 'exercises' && editingDayId;
  const showSetRepConfig = step === 'sets' && editingDayId;

  // Get the current editing day name
  const editingDay = days.find(d => d.id === editingDayId) || localDays.find(d => d.id === editingDayId);

  if (routineLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="spinner" size={32} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading routine...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {showSplitSelector && (
        <SplitSelector
          onSelectSplit={handleSelectSplit}
          onCustomSplit={handleCustomSplit}
        />
      )}

      {showDayEditor && (
        <DayEditor
          days={localDays}
          splitConfig={selectedSplit || SPLIT_CONFIGS[0]}
          onDaysChange={setLocalDays}
          onSave={handleSaveDays}
          onCancel={handleCancelDays}
        />
      )}

      {showExercisePicker && editingDay && (
        <ExercisePicker
          dayId={editingDayId}
          selectedExercises={dayExercises}
          onAddExercise={handleExerciseAdded}
          onClose={handleBackFromExercises}
        />
      )}

      {showSetRepConfig && editingDay && (
        <SetRepConfig
          exercises={dayExercises}
          onUpdateExercise={handleExerciseUpdated}
          onReorder={handleExercisesReordered}
          onDelete={handleExerciseDeleted}
          onClose={handleBackFromSets}
          dayName={editingDay.name}
        />
      )}

      {/* Show routine summary if active routine exists and we're not in builder */}
      {activeRoutine && step === 'days' && localDays.length > 0 && !showExercisePicker && !showSetRepConfig && (
        <RoutineSummaryView
          routine={activeRoutine}
          days={days}
          onEditDay={handleEditDayExercises}
          onNewRoutine={() => setStep('split')}
        />
      )}

      {activeRoutine && step === 'split' && (
        <RoutineSummaryView
          routine={activeRoutine}
          days={days}
          onEditDay={handleEditDayExercises}
          onNewRoutine={() => setStep('split')}
        />
      )}
    </SafeAreaView>
  );
}

// Separate component for routine summary to avoid re-renders
function RoutineSummaryView({ routine, days, onEditDay, onNewRoutine }: {
  routine: any;
  days: RoutineDay[];
  onEditDay: (day: RoutineDay) => void;
  onNewRoutine: () => void;
}) {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryTitle}>{routine.name}</Text>
          <Text style={styles.summaryMeta}>
            {routine.days_per_week} days/week • {days.length} workout days configured
          </Text>
        </View>
        <TouchableOpacity style={styles.newRoutineButton} onPress={onNewRoutine}>
          <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
          <Text style={styles.newRoutineButtonText}>New Routine</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryDaysList}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={day.id}
            style={styles.summaryDayCard}
            onPress={() => onEditDay(day)}
            activeOpacity={0.7}
          >
            <View style={styles.summaryDayLeft}>
              <View style={[styles.summaryDayBadge, { backgroundColor: getDayColor(index) }]}>
                <Text style={styles.summaryDayNumber}>{index + 1}</Text>
              </View>
              <View>
                <Text style={styles.summaryDayName}>{day.name}</Text>
                <Text style={styles.summaryDayOrder}>Day {day.day_order + 1} of {days.length}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryFooter}>
        <Text style={styles.summaryFooterText}>
          Tap a day to add exercises and configure sets/reps
        </Text>
      </View>
    </View>
  );
}

function getDayColor(index: number): string {
  const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#06b6d4', '#eab308'];
  return colors[index % colors.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  summaryContainer: {
    flex: 1,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  summaryMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  newRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
  },
  newRoutineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  summaryDaysList: {
    gap: 10,
  },
  summaryDayCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  summaryDayBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryDayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  summaryDayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  summaryDayOrder: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  summaryFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryFooterText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
});