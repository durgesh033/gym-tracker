'use client';

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@lib/auth';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // TODO: Replace with actual next workout day from database
  const nextWorkout = {
    dayName: 'Push',
    routineName: 'PPL (6-day)',
    exercises: [
      { name: 'Barbell Bench Press', sets: 3, reps: '8-12' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '8-12' },
      { name: 'Cable Fly', sets: 3, reps: '10-15' },
      { name: 'Overhead Dumbbell Press', sets: 3, reps: '8-12' },
      { name: 'Lateral Raise', sets: 3, reps: '12-15' },
      { name: 'Tricep Pushdown', sets: 3, reps: '10-15' },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ready to lift,</Text>
            <Text style={styles.name}>{user?.email?.split('@')[0] || 'Athlete'}</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Ionicons name="person-circle" size={40} color="#1a1a2e" />
          </TouchableOpacity>
        </View>

        {/* Next Workout Card */}
        <View style={styles.nextWorkoutCard}>
          <View style={styles.nextWorkoutHeader}>
            <Text style={styles.nextWorkoutLabel}>NEXT WORKOUT</Text>
            <Text style={styles.routineName}>{nextWorkout.routineName}</Text>
          </View>
          <Text style={styles.dayName}>{nextWorkout.dayName} Day</Text>

          <View style={styles.exerciseList}>
            {nextWorkout.exercises.map((ex, i) => (
              <TouchableOpacity key={i} style={styles.exerciseRow} onPress={() => router.push('/workout/active')}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseDetails}>{ex.sets} sets × {ex.reps} reps</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={() => router.push('/workout/active')}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>3h 24m</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 18,
    color: '#6b7280',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextWorkoutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nextWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  nextWorkoutLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    letterSpacing: 0.5,
  },
  routineName: {
    fontSize: 14,
    color: '#6b7280',
  },
  dayName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  exerciseList: {
    marginBottom: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  exerciseDetails: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  startButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
});