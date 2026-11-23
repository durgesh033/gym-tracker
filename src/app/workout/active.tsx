'use client';

import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // TODO: Fetch from database based on routine_day_id
  const workout = {
    dayName: 'Push',
    exercises: [
      {
        id: '1',
        name: 'Barbell Bench Press',
        setsTarget: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 180,
        lastSets: [
          { weight: 80, reps: 10 },
          { weight: 80, reps: 9 },
          { weight: 75, reps: 11 },
        ],
      },
      {
        id: '2',
        name: 'Incline Dumbbell Press',
        setsTarget: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 120,
        lastSets: [
          { weight: 30, reps: 10 },
          { weight: 30, reps: 9 },
          { weight: 28, reps: 11 },
        ],
      },
      {
        id: '3',
        name: 'Cable Fly',
        setsTarget: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 90,
        lastSets: [
          { weight: 20, reps: 12 },
          { weight: 20, reps: 11 },
          { weight: 18, reps: 14 },
        ],
      },
      {
        id: '4',
        name: 'Overhead Dumbbell Press',
        setsTarget: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 120,
        lastSets: [
          { weight: 24, reps: 9 },
          { weight: 24, reps: 8 },
          { weight: 22, reps: 10 },
        ],
      },
      {
        id: '5',
        name: 'Lateral Raise',
        setsTarget: 3,
        repsMin: 12,
        repsMax: 15,
        restSeconds: 60,
        lastSets: [
          { weight: 10, reps: 14 },
          { weight: 10, reps: 13 },
          { weight: 9, reps: 15 },
        ],
      },
      {
        id: '6',
        name: 'Tricep Pushdown',
        setsTarget: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 60,
        lastSets: [
          { weight: 30, reps: 12 },
          { weight: 30, reps: 11 },
          { weight: 28, reps: 14 },
        ],
      },
    ],
  };

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, Array<{ weight: number; reps: number }>>>({});

  const currentExercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

  const handleSetComplete = (exerciseId: string, setIndex: number, weight: string, reps: string) => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (isNaN(w) || isNaN(r)) return;

    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: [
        ...(prev[exerciseId] || []),
        { weight: w, reps: r },
      ],
    }));
  };

  const handleNextExercise = () => {
    if (isLastExercise) {
      Alert.alert('Workout Complete!', 'Great job! Your workout has been saved.', [
        { text: 'View Summary', onPress: () => router.replace('/(tabs)') },
        { text: 'Done', onPress: () => router.replace('/(tabs)') },
      ]);
    } else {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const getPrefillWeight = (exercise: typeof currentExercise, setIndex: number) => {
    if (exercise.lastSets[setIndex]) {
      return exercise.lastSets[setIndex].weight.toString();
    }
    return '';
  };

  const getPrefillReps = (exercise: typeof currentExercise, setIndex: number) => {
    if (exercise.lastSets[setIndex]) {
      return exercise.lastSets[setIndex].reps.toString();
    }
    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevExercise} disabled={currentExerciseIndex === 0}>
          <Ionicons name="chevron-back" size={28} color="#1a1a2e" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.dayName}>{workout.dayName}</Text>
          <Text style={styles.exerciseCounter}>
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </Text>
        </View>
        <TouchableOpacity onPress={handleNextExercise} disabled={!isLastExercise && currentExerciseIndex === workout.exercises.length - 1}>
          <Ionicons name={isLastExercise ? 'checkmark' : 'chevron-forward'} size={28} color="#1a1a2e" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Exercise Card */}
        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <View style={styles.exerciseMeta}>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>{currentExercise.setsTarget} sets</Text>
              <Text style={styles.metaValue}>× {currentExercise.repsMin}-{currentExercise.repsMax} reps</Text>
            </Text>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Rest</Text>
              <Text style={styles.metaValue}>{currentExercise.restSeconds}s</Text>
            </Text>
          </View>

          {/* Last workout reference */}
          {currentExercise.lastSets.length > 0 && (
            <View style={styles.lastWorkout}>
              <Text style={styles.lastWorkoutLabel}>Last workout:</Text>
              <View style={styles.lastSetsRow}>
                {currentExercise.lastSets.map((set, i) => (
                  <Text key={i} style={styles.lastSet}>
                    {set.weight}kg × {set.reps}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Set inputs */}
          <View style={styles.setsContainer}>
            {Array.from({ length: currentExercise.setsTarget }, (_, i) => (
              <SetRow
                key={i}
                setNumber={i + 1}
                prefillWeight={getPrefillWeight(currentExercise, i)}
                prefillReps={getPrefillReps(currentExercise, i)}
                isCompleted={completedSets[currentExercise.id]?.[i]}
                onComplete={(weight, reps) => handleSetComplete(currentExercise.id, i, weight, reps)}
              />
            ))}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButtonSecondary} onPress={handlePrevExercise} disabled={currentExerciseIndex === 0}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButtonPrimary} onPress={handleNextExercise}>
            <Text style={styles.navButtonTextPrimary}>
              {isLastExercise ? 'Finish Workout' : 'Next Exercise'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SetRowProps {
  setNumber: number;
  prefillWeight: string;
  prefillReps: string;
  isCompleted: boolean;
  onComplete: (weight: string, reps: string) => void;
}

function SetRow({ setNumber, prefillWeight, prefillReps, isCompleted, onComplete }: SetRowProps) {
  const [weight, setWeight] = useState(prefillWeight);
  const [reps, setReps] = useState(prefillReps);

  const handlePress = () => {
    if (!isCompleted) {
      onComplete(weight, reps);
    }
  };

  return (
    <View style={styles.setRow}>
      <View style={styles.setNumber}>
        <Text style={styles.setNumberText}>Set {setNumber}</Text>
      </View>
      <View style={styles.inputPair}>
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          editable={!isCompleted}
        />
        <TextInput
          style={styles.input}
          placeholder="Reps"
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
          editable={!isCompleted}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.completeButton,
          isCompleted && styles.completeButtonDone,
        ]}
        onPress={handlePress}
        disabled={isCompleted}
      >
        <Text style={[
          styles.completeButtonText,
          isCompleted && styles.completeButtonTextDone,
        ]}>
          {isCompleted ? '✓' : 'Done'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  exerciseCounter: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  exerciseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'column',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
    marginTop: 2,
  },
  lastWorkout: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  lastWorkoutLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 6,
  },
  lastSetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lastSet: {
    backgroundColor: '#fde68a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#92400e',
  },
  setsContainer: {
    marginTop: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  setNumber: {
    width: 60,
  },
  setNumberText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  inputPair: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  completeButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 70,
  },
  completeButtonDone: {
    backgroundColor: '#10b981',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  completeButtonTextDone: {
    color: '#fff',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButtonSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  navButtonPrimary: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});