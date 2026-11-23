'use client';

import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoutineDay, SplitConfig } from '@types/routine';

interface DayEditorProps {
  days: RoutineDay[];
  splitConfig: SplitConfig;
  onDaysChange: (days: RoutineDay[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function DayEditor({ days, splitConfig, onDaysChange, onSave, onCancel }: DayEditorProps) {
  const [editingDay, setEditingDay] = useState<RoutineDay | null>(null);
  const [newDayName, setNewDayName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddDay = () => {
    if (!newDayName.trim()) return;
    const newDay: RoutineDay = {
      id: `temp-${Date.now()}`,
      routine_id: '',
      name: newDayName.trim(),
      day_order: days.length,
      created_at: new Date().toISOString(),
    };
    onDaysChange([...days, newDay]);
    setNewDayName('');
    setShowAddModal(false);
  };

  const handleUpdateDay = (day: RoutineDay) => {
    if (!editingDay) return;
    onDaysChange(days.map(d => d.id === editingDay.id ? { ...d, name: day.name } : d));
    setEditingDay(null);
  };

  const handleDeleteDay = (dayId: string) => {
    Alert.alert('Delete Day', 'Are you sure you want to delete this day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = days.filter(d => d.id !== dayId);
          const reordered = filtered.map((d, i) => ({ ...d, day_order: i }));
          onDaysChange(reordered);
        },
      },
    ]);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newDays = [...days];
    const [removed] = newDays.splice(fromIndex, 1);
    newDays.splice(toIndex, 0, removed);
    const reordered = newDays.map((d, i) => ({ ...d, day_order: i }));
    onDaysChange(reordered);
  };

  const moveDay = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < days.length) {
      handleReorder(index, newIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Configure Workout Days</Text>
          <Text style={styles.subtitle}>
            {splitConfig.type === 'custom'
              ? 'Add, rename, and reorder your workout days'
              : `Editing ${splitConfig.name} — customize as needed`}
          </Text>
        </View>

        {days.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="add-circle-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No workout days yet</Text>
            <Text style={styles.emptyDesc}>Add your first workout day to get started</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Day</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.daysList}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayCard, editingDay?.id === day.id && styles.dayCardEditing]}
                onPress={() => editingDay?.id === day.id ? null : setEditingDay(day)}
                activeOpacity={0.8}
              >
                <View style={styles.dragHandle} onPress={() => {}}>
                  <Ionicons name="reorder-three-outline" size={20} color="#9ca3af" />
                </View>
                <View style={styles.dayContent}>
                  {editingDay?.id === day.id ? (
                    <View style={styles.editInputContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editingDay.name}
                        onChangeText={(name) => setEditingDay({ ...editingDay, name })}
                        onBlur={() => handleUpdateDay(editingDay)}
                        onSubmitEditing={() => handleUpdateDay(editingDay)}
                        autoFocus
                        maxLength={30}
                      />
                    </View>
                  ) : (
                    <Text style={styles.dayName}>{day.name}</Text>
                  )}
                  <Text style={styles.dayOrder}>Day {day.day_order + 1} of {days.length}</Text>
                </View>
                <View style={styles.dayActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => moveDay(index, -1)}
                    disabled={index === 0}
                  >
                    <Ionicons name="chevron-up" size={20} color={index === 0 ? '#e5e7eb' : '#6b7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => moveDay(index, 1)}
                    disabled={index === days.length - 1}
                  >
                    <Ionicons name="chevron-down" size={20} color={index === days.length - 1 ? '#e5e7eb' : '#6b7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteDay(day.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={onSave} disabled={days.length === 0}>
            <Text style={styles.primaryButtonText}>
              {days.length === 0 ? 'Add at least one day' : `Continue (${days.length} days)`}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.floatingAdd} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </ScrollView>

      {/* Add Day Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true} onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <View style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Workout Day</Text>
            <Text style={styles.modalDesc}>Give this workout day a name (e.g., "Push", "Upper A", "Legs")</Text>
            <TextInput
              style={styles.modalInput}
              value={newDayName}
              onChangeText={setNewDayName}
              placeholder="Day name"
              autoFocus
              maxLength={30}
              onSubmitEditing={handleAddDay}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleAddDay} disabled={!newDayName.trim()}>
                <Text style={styles.modalButtonTextPrimary}>Add Day</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import { useState } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  daysList: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dayCardEditing: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  dayContent: {
    flex: 1,
  },
  editInputContainer: {
    flex: 1,
  },
  editInput: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  dayOrder: {
    fontSize: 13,
    color: '#9ca3af',
  },
  dayActions: {
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
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  floatingAdd: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});