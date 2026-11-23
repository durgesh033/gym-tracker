'use client';

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoutineExercise, Exercise } from '@types/routine';
import { useState, useMemo, useCallback } from 'react';

interface SetRepConfigProps {
  exercises: (RoutineExercise & { exercise: Exercise })[];
  onUpdateExercise: (id: string, updates: Partial<RoutineExercise>) => void;
  onReorder: (exerciseOrders: { id: string; exercise_order: number }[]) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  dayName: string;
}

export function SetRepConfig({ exercises, onUpdateExercise, onReorder, onDelete, onClose, dayName }: SetRepConfigProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<Partial<RoutineExercise>>({});

  const handleEditPress = useCallback((ex: RoutineExercise & { exercise: Exercise }) => {
    setEditingId(ex.id);
    setEditConfig({
      sets_target: ex.sets_target,
      reps_min: ex.reps_min,
      reps_max: ex.reps_max,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes,
    });
  }, []);

  const handleSave = useCallback((id: string) => {
    onUpdateExercise(id, editConfig);
    setEditingId(null);
    setEditConfig({});
  }, [editConfig, onUpdateExercise]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditConfig({});
  }, []);

  const handleNumberChange = useCallback((field: keyof RoutineExercise, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setEditConfig(prev => ({ ...prev, [field]: num }));
    }
  }, []);

  const handleNotesChange = useCallback((value: string) => {
    setEditConfig(prev => ({ ...prev, notes: value }));
  }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Delete Exercise', 'Remove this exercise from the workout day?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(id) },
    ]);
  }, [onDelete]);

  const moveExercise = useCallback((index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < exercises.length) {
      const newOrders = exercises.map((ex, i) => ({
        id: ex.id,
        exercise_order: i === index ? newIndex : i === newIndex ? index : ex.exercise_order,
      }));
      onReorder(newOrders);
    }
  }, [exercises, onReorder]);

  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => a.exercise_order - b.exercise_order);
  }, [exercises]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="chevron-back" size={28} color="#1a1a2e" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Configure Sets & Reps</Text>
            <Text style={styles.headerSubtitle}>{dayName} • {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="add-circle-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No exercises yet</Text>
            <Text style={styles.emptyDesc}>Add exercises from the Exercise Picker first</Text>
          </View>
        ) : (
          <View style={styles.exercisesList}>
            {sortedExercises.map((ex, index) => (
              <View key={ex.id} style={styles.exerciseCardContainer}>
                {editingId === ex.id ? (
                  <View style={[styles.exerciseCard, styles.exerciseCardEditing]}>
                    <View style={styles.editHeader}>
                      <Text style={styles.editTitle}>{ex.exercise.name}</Text>
                      <TouchableOpacity style={styles.closeEdit} onPress={handleCancel}>
                        <Ionicons name="close" size={24} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.editGrid}>
                      <EditableNumberInput
                        label="Sets"
                        value={editConfig.sets_target ?? ex.sets_target}
                        onChange={v => handleNumberChange('sets_target', v)}
                        min={1}
                        max={20}
                        step={1}
                        icon="reorder-two-outline"
                      />
                      <EditableNumberInput
                        label="Min Reps"
                        value={editConfig.reps_min ?? ex.reps_min}
                        onChange={v => handleNumberChange('reps_min', v)}
                        min={1}
                        max={50}
                        step={1}
                        icon="remove-circle-outline"
                      />
                      <EditableNumberInput
                        label="Max Reps"
                        value={editConfig.reps_max ?? ex.reps_max}
                        onChange={v => handleNumberChange('reps_max', v)}
                        min={1}
                        max={50}
                        step={1}
                        icon="add-circle-outline"
                      />
                      <EditableNumberInput
                        label="Rest (sec)"
                        value={editConfig.rest_seconds ?? ex.rest_seconds}
                        onChange={v => handleNumberChange('rest_seconds', v)}
                        min={15}
                        max={600}
                        step={15}
                        icon="timer-outline"
                      />
                    </View>

                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>Notes (optional)</Text>
                      <TextInput
                        style={styles.notesInput}
                        value={editConfig.notes ?? ex.notes ?? ''}
                        onChangeText={handleNotesChange}
                        placeholder="Rest pause, tempo, RPE target, etc."
                        multiline
                        numberOfLines={3}
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    <View style={styles.editActions}>
                      <TouchableOpacity style={styles.editActionSecondary} onPress={handleCancel}>
                        <Text style={styles.editActionText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.editActionPrimary} onPress={() => handleSave(ex.id)}>
                        <Text style={styles.editActionTextPrimary}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.exerciseCard}
                    activeOpacity={0.8}
                  >
                    <View style={styles.exerciseMain}>
                      <View style={styles.dragHandle} onPress={() => {}}>
                        <Ionicons name="reorder-three-outline" size={20} color="#9ca3af" />
                      </View>
                      <View style={styles.exerciseInfo}>
                        <View style={styles.exerciseHeader}>
                          <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                          <Text style={[styles.exerciseOrder, { backgroundColor: getMuscleColor(ex.exercise.muscle_group) }]}>
                            #{ex.exercise_order + 1}
                          </Text>
                        </View>
                        <View style={styles.exerciseMeta}>
                          <View style={styles.metaRow}>
                            <Ionicons name={MUSCLE_GROUP_ICONS[ex.exercise.muscle_group] || 'fitness-outline'} size={14} color={getMuscleColor(ex.exercise.muscle_group)} />
                            <Text style={styles.exerciseMuscle}>{ex.exercise.muscle_group}</Text>
                          </View>
                          <View style={styles.configSummary}>
                            <ConfigBadge icon="reorder-two-outline" value={ex.sets_target} label="sets" color="#3b82f6" />
                            <ConfigBadge icon="remove-circle-outline" value={`${ex.reps_min}–${ex.reps_max}`} label="reps" color="#22c55e" />
                            <ConfigBadge icon="timer-outline" value={`${ex.rest_seconds}s`} label="rest" color="#f97316" />
                          </View>
                        </View>
                      </View>
                      <View style={styles.exerciseActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => moveExercise(index, -1)}
                          disabled={index === 0}
                        >
                          <Ionicons name="chevron-up" size={20} color={index === 0 ? '#e5e7eb' : '#6b7280'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => moveExercise(index, 1)}
                          disabled={index === sortedExercises.length - 1}
                        >
                          <Ionicons name="chevron-down" size={20} color={index === sortedExercises.length - 1 ? '#e5e7eb' : '#6b7280'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditPress(ex)}>
                          <Ionicons name="create-outline" size={20} color="#3b82f6" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(ex.id)}>
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>
            💡 Double Progression: Increase weight when you hit max reps on all sets. Then build back up.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EditableNumberInput({ label, value, onChange, min, max, step, icon }: { label: string; value: number; onChange: (v: string) => void; min: number; max: number; step: number; icon: string }) {
  return (
    <View style={styles.editableInputWrapper}>
      <Text style={styles.editableInputLabel}>{label}</Text>
      <View style={styles.editableInputRow}>
        <TouchableOpacity style={styles.editableInputButton} onPress={() => onChange(String(Math.max(min, value - step)))} disabled={value <= min}>
          <Ionicons name="remove" size={20} color={value <= min ? '#e5e7eb' : '#6b7280'} />
        </TouchableOpacity>
        <TextInput
          style={styles.editableInput}
          value={value.toString()}
          onChangeText={onChange}
          keyboardType="numeric"
          textAlign="center"
        />
        <TouchableOpacity style={styles.editableInputButton} onPress={() => onChange(String(Math.min(max, value + step)))} disabled={value >= max}>
          <Ionicons name="add" size={20} color={value >= max ? '#e5e7eb' : '#6b7280'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ConfigBadge({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <View style={[styles.configBadge, { borderColor: color }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.configBadgeValue, { color }]}>{value}</Text>
      <Text style={[styles.configBadgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
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
  exercisesList: {
    gap: 12,
  },
  exerciseCardContainer: {
    marginBottom: 4,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseCardEditing: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  exerciseMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    flex: 1,
    marginRight: 12,
  },
  exerciseOrder: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 28,
    textAlign: 'center',
  },
  exerciseMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseMuscle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  configSummary: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  configBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#f9fafb',
  },
  configBadgeValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  configBadgeLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    marginLeft: 4,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  closeEdit: {
    padding: 4,
  },
  editGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  editableInputWrapper: {
    flex: 1,
    minWidth: '45%',
  },
  editableInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editableInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editableInputButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editableInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editActionSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editActionPrimary: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  editActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  editActionTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  bottomInfoText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 20,
  },
});