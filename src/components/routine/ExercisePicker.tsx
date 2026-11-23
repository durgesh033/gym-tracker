'use client';

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise, RoutineExercise, MUSCLE_GROUPS } from '@types/routine';
import { useExerciseLibrary } from '@hooks/useRoutines';
import { useState, useMemo, useCallback } from 'react';

interface ExercisePickerProps {
  dayId: string;
  selectedExercises: (RoutineExercise & { exercise: Exercise })[];
  onAddExercise: (exercise: Exercise, sets: number, repsMin: number, repsMax: number, restSeconds: number) => void;
  onClose: () => void;
}

const DEFAULT_SETS = 3;
const DEFAULT_REPS_MIN = 8;
const DEFAULT_REPS_MAX = 12;
const DEFAULT_REST = 90;

const MUSCLE_GROUP_ICONS: Record<string, string> = {
  chest: 'flash-outline',
  back: 'logo-buffer',
  quads: 'walk-outline',
  hamstrings: 'walk-outline',
  glutes: 'fitness-outline',
  shoulders: 'logo-buffer',
  biceps: 'fitness-outline',
  triceps: 'flash-outline',
  calves: 'walk-outline',
  abs: 'fitness-outline',
  forearms: 'fitness-outline',
};

export function ExercisePicker({ dayId, selectedExercises, onAddExercise, onClose }: ExercisePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | 'all'>('all');
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null);
  const [config, setConfig] = useState({
    sets: DEFAULT_SETS,
    repsMin: DEFAULT_REPS_MIN,
    repsMax: DEFAULT_REPS_MAX,
    restSeconds: DEFAULT_REST,
  });

  const { data: exercises = [], isLoading, error } = useExerciseLibrary(selectedMuscleGroup === 'all' ? undefined : selectedMuscleGroup);

  const selectedExerciseIds = new Set(selectedExercises.map(e => e.exercise_id));

  const filteredExercises = useMemo(() => {
    let result = exercises;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.muscle_group.toLowerCase().includes(query) ||
        e.movement_pattern?.toLowerCase().includes(query) ||
        e.equipment?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [exercises, searchQuery]);

  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    filteredExercises.forEach(ex => {
      const group = ex.muscle_group;
      if (!groups[group]) groups[group] = [];
      groups[group].push(ex);
    });
    return groups;
  }, [filteredExercises]);

  const muscleGroupsWithExercises = useMemo(() => {
    return Object.entries(groupedExercises)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([muscleGroup, exercises]) => ({ muscleGroup, exercises }));
  }, [groupedExercises]);

  const handleAddExercise = useCallback((exercise: Exercise) => {
    setAddingExerciseId(exercise.id);
    setConfig({
      sets: DEFAULT_SETS,
      repsMin: DEFAULT_REPS_MIN,
      repsMax: DEFAULT_REPS_MAX,
      restSeconds: DEFAULT_REST,
    });
  }, []);

  const handleConfirmAdd = useCallback((exercise: Exercise) => {
    onAddExercise(exercise, config.sets, config.repsMin, config.repsMax, config.restSeconds);
    setAddingExerciseId(null);
  }, [config, onAddExercise]);

  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => {
    const isSelected = selectedExerciseIds.has(item.id);
    const isAdding = addingExerciseId === item.id;

    if (isAdding) {
      return (
        <View style={styles.configCard}>
          <View style={styles.configHeader}>
            <Text style={styles.configTitle}>Configure {item.name}</Text>
            <Ionicons name="close" size={24} color="#9ca3af" onPress={() => setAddingExerciseId(null)} />
          </View>
          <View style={styles.configGrid}>
            <ConfigInput
              label="Sets"
              value={config.sets}
              onChange={v => setConfig({ ...config, sets: Math.max(1, Math.min(20, v)) })}
              min={1}
              max={20}
              step={1}
            />
            <ConfigInput
              label="Min Reps"
              value={config.repsMin}
              onChange={v => setConfig({ ...config, repsMin: Math.max(1, Math.min(50, v)) })}
              min={1}
              max={50}
              step={1}
            />
            <ConfigInput
              label="Max Reps"
              value={config.repsMax}
              onChange={v => setConfig({ ...config, repsMax: Math.max(1, Math.min(50, v)) })}
              min={1}
              max={50}
              step={1}
            />
            <ConfigInput
              label="Rest (sec)"
              value={config.restSeconds}
              onChange={v => setConfig({ ...config, restSeconds: Math.max(15, Math.min(600, v)) })}
              min={15}
              max={600}
              step={15}
            />
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirmAdd(item)}>
            <Text style={styles.confirmButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.exerciseCard, isSelected && styles.exerciseCardSelected]}
        onPress={() => isSelected ? null : handleAddExercise(item)}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseLeft}>
          <View style={[styles.muscleBadge, { backgroundColor: getMuscleColor(item.muscle_group) }]}>
            <Ionicons name={MUSCLE_GROUP_ICONS[item.muscle_group] || 'fitness-outline'} size={18} color="#fff" />
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.exerciseMeta}>
              <Text style={styles.exerciseMuscle}>{item.muscle_group}</Text>
              {item.movement_pattern && (
                <>
                  <Text style={styles.exerciseDot}>·</Text>
                  <Text style={styles.exercisePattern}>{formatMovementPattern(item.movement_pattern)}</Text>
                </>
              )}
              {item.equipment && (
                <>
                  <Text style={styles.exerciseDot}>·</Text>
                  <Text style={styles.exerciseEquipment}>{item.equipment}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={styles.exerciseRight}>
          {isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
          ) : (
            <Ionicons name="add-circle-outline" size={24} color="#9ca3af" />
          )}
        </View>
      </TouchableOpacity>
    );
  }, [selectedExerciseIds, addingExerciseId, config, handleAddExercise, handleConfirmAdd]);

  const renderSectionHeader = useCallback(({ section }: { section: { muscleGroup: string; exercises: Exercise[] } }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionBadge, { backgroundColor: getMuscleColor(section.muscleGroup) }]}>
        <Ionicons name={MUSCLE_GROUP_ICONS[section.muscleGroup] || 'fitness-outline'} size={14} color="#fff" />
        <Text style={styles.sectionBadgeText}>{section.muscleGroup.toUpperCase()}</Text>
      </View>
      <Text style={styles.sectionCount}>{section.exercises.length} exercises</Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="spinner" size={32} color="#3b82f6" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load exercises</Text>
          <Text style={styles.errorDesc}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onClose}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back" size={28} color="#1a1a2e" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add Exercises</Text>
          <Text style={styles.headerSubtitle}>Select exercises for this workout day</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.muscleFilterScroll} contentContainerStyle={styles.muscleFilterContent}>
        <TouchableOpacity
          style={[styles.muscleFilterChip, selectedMuscleGroup === 'all' && styles.muscleFilterChipActive]}
          onPress={() => setSelectedMuscleGroup('all')}
        >
          <Text style={[styles.muscleFilterText, selectedMuscleGroup === 'all' && styles.muscleFilterTextActive]}>All</Text>
        </TouchableOpacity>
        {MUSCLE_GROUPS.map(mg => (
          <TouchableOpacity
            key={mg}
            style={[styles.muscleFilterChip, selectedMuscleGroup === mg && styles.muscleFilterChipActive, { borderColor: getMuscleColor(mg) }]}
            onPress={() => setSelectedMuscleGroup(mg)}
          >
            <View style={[styles.muscleFilterIcon, { backgroundColor: getMuscleColor(mg) }]}>
              <Ionicons name={MUSCLE_GROUP_ICONS[mg] || 'fitness-outline'} size={12} color="#fff" />
            </View>
            <Text style={[styles.muscleFilterText, selectedMuscleGroup === mg && styles.muscleFilterTextActive, { color: selectedMuscleGroup === mg ? '#fff' : getMuscleColor(mg) }]}>{mg.charAt(0).toUpperCase() + mg.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedExercises.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.selectedSummaryText}>
            {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} added
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={() => {
            Alert.alert('Clear Selection', 'Remove all selected exercises?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: () => {
                selectedExercises.forEach(e => onAddExercise(e.exercise, 0, 0, 0, 0));
              }},
            ]);
          }}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {muscleGroupsWithExercises.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No exercises found</Text>
          <Text style={styles.emptyDesc}>Try adjusting your search or filter</Text>
        </View>
      ) : (
        <FlatList
          data={muscleGroupsWithExercises}
          keyExtractor={item => item.muscleGroup}
          renderItem={({ item }) => (
            <View style={styles.muscleGroupSection}>
              {renderSectionHeader({ section: item })}
              <FlatList
                data={item.exercises}
                keyExtractor={ex => ex.id}
                renderItem={renderExerciseItem}
                ListContentComponentStyle={styles.exerciseList}
              />
            </View>
          )}
          ListFooterComponentStyle={styles.listFooter}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

function ConfigInput({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  return (
    <View style={styles.configInputWrapper}>
      <Text style={styles.configInputLabel}>{label}</Text>
      <View style={styles.configInputRow}>
        <TouchableOpacity style={styles.configInputButton} onPress={() => onChange(Math.max(min, value - step))} disabled={value <= min}>
          <Ionicons name="remove" size={20} color={value <= min ? '#e5e7eb' : '#6b7280'} />
        </TouchableOpacity>
        <TextInput
          style={styles.configInput}
          value={value.toString()}
          onChangeText={t => {
            const n = parseInt(t, 10);
            if (!isNaN(n)) onChange(Math.max(min, Math.max(max, n)));
          }}
          onBlur={() => {}}
          keyboardType="numeric"
          textAlign="center"
        />
        <TouchableOpacity style={styles.configInputButton} onPress={() => onChange(Math.min(max, value + step))} disabled={value >= max}>
          <Ionicons name="add" size={20} color={value >= max ? '#e5e7eb' : '#6b7280'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getMuscleColor(muscleGroup: string): string {
  const colors: Record<string, string> = {
    chest: '#ef4444',
    back: '#3b82f6',
    quads: '#22c55e',
    hamstrings: '#16a34a',
    glutes: '#84cc16',
    shoulders: '#f97316',
    biceps: '#eab308',
    triceps: '#a855f7',
    calves: '#06b6d4',
    abs: '#ec4899',
    forearms: '#6366f1',
  };
  return colors[muscleGroup] || '#6b7280';
}

function formatMovementPattern(pattern: string): string {
  return pattern.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a2e',
  },
  muscleFilterScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  muscleFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  muscleFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  muscleFilterChipActive: {
    borderWidth: 0,
  },
  muscleFilterIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleFilterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  muscleFilterTextActive: {
    fontWeight: '600',
  },
  selectedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectedSummaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  muscleGroupSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 13,
    color: '#9ca3af',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseCardSelected: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  muscleBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  exerciseMuscle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  exerciseDot: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  exercisePattern: {
    fontSize: 12,
    color: '#9ca3af',
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#9ca3af',
  },
  exerciseRight: {
    paddingLeft: 12,
  },
  configCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  configGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  configInputWrapper: {
    flex: 1,
    minWidth: '45%',
  },
  configInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  configInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  configInputButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 16,
  },
  errorDesc: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    paddingBottom: 40,
  },
  listFooter: {
    paddingBottom: 40,
  },
});