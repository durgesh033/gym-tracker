'use client';

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SplitConfig, SPLIT_CONFIGS } from '@types/routine';

interface SplitSelectorProps {
  onSelectSplit: (split: SplitConfig) => void;
  onCustomSplit: () => void;
}

export function SplitSelector({ onSelectSplit, onCustomSplit }: SplitSelectorProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Split</Text>
          <Text style={styles.subtitle}>Pick a proven template or build your own</Text>
        </View>

        <View style={styles.list}>
          {SPLIT_CONFIGS.map((split, index) => (
            <TouchableOpacity
              key={split.name}
              style={styles.splitCard}
              onPress={() => split.type === 'custom' ? onCustomSplit() : onSelectSplit(split)}
            >
              <View style={styles.splitInfo}>
                <Text style={styles.splitName}>{split.name}</Text>
                <Text style={styles.splitDesc}>{split.description}</Text>
                <View style={styles.splitMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                    <Text style={styles.metaText}>{split.daysPerWeek} days/week</Text>
                  </View>
                  {split.restDays.length > 0 && (
                    <View style={styles.metaItem}>
                      <Ionicons name="moon-outline" size={16} color="#9ca3af" />
                      <Text style={styles.metaText}>Fixed rest: {split.restDays.map(d => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d]).join(', ')}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.splitDays}>
                {split.defaultDays.slice(0, 3).map((day, i) => (
                  <Text key={i} style={styles.dayChip}>{day.name}</Text>
                ))}
                {split.defaultDays.length > 3 && (
                  <Text style={[styles.dayChip, styles.dayChipMore]}>+{split.defaultDays.length - 3} more</Text>
                )}
                {split.type === 'custom' && <Text style={styles.dayChipCustom}>Build your own</Text>}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can always modify days, exercises, and sets later in the Routine Builder.
          </Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  list: {
    gap: 12,
  },
  splitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  splitInfo: {
    flex: 1,
    marginRight: 16,
  },
  splitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  splitDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  splitMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  splitDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  dayChip: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },
  dayChipMore: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  dayChipCustom: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});