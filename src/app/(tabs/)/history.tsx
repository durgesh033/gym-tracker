'use client';

import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="stats-chart-outline" size={64} color="#9ca3af" />
        <Text style={styles.title}>History & Progress</Text>
        <Text style={styles.subtitle}>View your workout history and track gains</Text>
        <Text style={styles.comingSoon}>Coming in Session 6</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 24,
    fontWeight: '500',
  },
});