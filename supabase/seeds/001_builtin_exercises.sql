-- Built-in Exercise Library Seed Data
-- Run this AFTER 001_initial_schema.sql

INSERT INTO public.exercises (name, muscle_group, movement_pattern, equipment, is_builtin) VALUES
-- CHEST
('Barbell Bench Press', 'chest', 'horizontal_push', 'barbell', TRUE),
('Dumbbell Bench Press', 'chest', 'horizontal_push', 'dumbbell', TRUE),
('Incline Barbell Bench Press', 'chest', 'horizontal_push', 'barbell', TRUE),
('Incline Dumbbell Bench Press', 'chest', 'horizontal_push', 'dumbbell', TRUE),
('Decline Barbell Bench Press', 'chest', 'horizontal_push', 'barbell', TRUE),
('Decline Dumbbell Bench Press', 'chest', 'horizontal_push', 'dumbbell', TRUE),
('Machine Chest Press', 'chest', 'horizontal_push', 'machine', TRUE),
('Cable Fly', 'chest', 'horizontal_push', 'cable', TRUE),
('Dumbbell Fly', 'chest', 'horizontal_push', 'dumbbell', TRUE),
('Pec Deck Machine', 'chest', 'horizontal_push', 'machine', TRUE),
('Push-up', 'chest', 'horizontal_push', 'bodyweight', TRUE),
('Incline Push-up', 'chest', 'horizontal_push', 'bodyweight', TRUE),
('Decline Push-up', 'chest', 'horizontal_push', 'bodyweight', TRUE),
('Dip (Chest Focus)', 'chest', 'vertical_push', 'bodyweight', TRUE),

-- BACK
('Pull-up', 'back', 'vertical_pull', 'bodyweight', TRUE),
('Chin-up', 'back', 'vertical_pull', 'bodyweight', TRUE),
('Lat Pulldown', 'back', 'vertical_pull', 'machine', TRUE),
('Barbell Row', 'back', 'horizontal_pull', 'barbell', TRUE),
('Dumbbell Row', 'back', 'horizontal_pull', 'dumbbell', TRUE),
('Seated Cable Row', 'back', 'horizontal_pull', 'cable', TRUE),
('T-Bar Row', 'back', 'horizontal_pull', 'barbell', TRUE),
('Chest-Supported Row', 'back', 'horizontal_pull', 'machine', TRUE),
('Single-Arm Dumbbell Row', 'back', 'horizontal_pull', 'dumbbell', TRUE),
('Machine Row', 'back', 'horizontal_pull', 'machine', TRUE),
('Face Pull', 'back', 'horizontal_pull', 'cable', TRUE),
('Straight-Arm Pulldown', 'back', 'vertical_pull', 'cable', TRUE),
('Deadlift', 'back', 'hip_dominant', 'barbell', TRUE),
('Romanian Deadlift', 'back', 'hip_dominant', 'barbell', TRUE),
('Back Extension', 'back', 'hip_dominant', 'machine', TRUE),

-- QUADS
('Barbell Back Squat', 'quads', 'knee_dominant', 'barbell', TRUE),
('Barbell Front Squat', 'quads', 'knee_dominant', 'barbell', TRUE),
('Goblet Squat', 'quads', 'knee_dominant', 'dumbbell', TRUE),
('Leg Press', 'quads', 'knee_dominant', 'machine', TRUE),
('Hack Squat', 'quads', 'knee_dominant', 'machine', TRUE),
('Bulgarian Split Squat', 'quads', 'knee_dominant', 'dumbbell', TRUE),
('Lunge', 'quads', 'knee_dominant', 'dumbbell', TRUE),
('Walking Lunge', 'quads', 'knee_dominant', 'dumbbell', TRUE),
('Step-up', 'quads', 'knee_dominant', 'dumbbell', TRUE),
('Leg Extension', 'quads', 'knee_dominant', 'machine', TRUE),
('Sissy Squat', 'quads', 'knee_dominant', 'bodyweight', TRUE),

-- HAMSTRINGS
('Romanian Deadlift', 'hamstrings', 'hip_dominant', 'barbell', TRUE),
('Stiff-Leg Deadlift', 'hamstrings', 'hip_dominant', 'barbell', TRUE),
('Good Morning', 'hamstrings', 'hip_dominant', 'barbell', TRUE),
('Lying Leg Curl', 'hamstrings', 'knee_dominant', 'machine', TRUE),
('Seated Leg Curl', 'hamstrings', 'knee_dominant', 'machine', TRUE),
('Standing Leg Curl', 'hamstrings', 'knee_dominant', 'machine', TRUE),
('Nordic Hamstring Curl', 'hamstrings', 'knee_dominant', 'bodyweight', TRUE),
('Glute-Ham Raise', 'hamstrings', 'hip_dominant', 'machine', TRUE),
('Kettlebell Swing', 'hamstrings', 'hip_dominant', 'dumbbell', TRUE),
('Cable Pull-Through', 'hamstrings', 'hip_dominant', 'cable', TRUE),

-- GLUTES
('Hip Thrust', 'glutes', 'hip_dominant', 'barbell', TRUE),
('Glute Bridge', 'glutes', 'hip_dominant', 'bodyweight', TRUE),
('Cable Kickback', 'glutes', 'hip_dominant', 'cable', TRUE),
('Machine Hip Abduction', 'glutes', 'hip_dominant', 'machine', TRUE),
('Banded Clamshell', 'glutes', 'hip_dominant', 'band', TRUE),

-- SHOULDERS
('Overhead Barbell Press', 'shoulders', 'vertical_push', 'barbell', TRUE),
('Overhead Dumbbell Press', 'shoulders', 'vertical_push', 'dumbbell', TRUE),
('Seated Dumbbell Press', 'shoulders', 'vertical_push', 'dumbbell', TRUE),
('Machine Shoulder Press', 'shoulders', 'vertical_push', 'machine', TRUE),
('Arnold Press', 'shoulders', 'vertical_push', 'dumbbell', TRUE),
('Pike Push-up', 'shoulders', 'vertical_push', 'bodyweight', TRUE),
('Handstand Push-up', 'shoulders', 'vertical_push', 'bodyweight', TRUE),
('Lateral Raise', 'shoulders', 'vertical_push', 'dumbbell', TRUE),
('Cable Lateral Raise', 'shoulders', 'vertical_push', 'cable', TRUE),
('Front Raise', 'shoulders', 'vertical_push', 'dumbbell', TRUE),
('Rear Delt Fly', 'shoulders', 'horizontal_pull', 'dumbbell', TRUE),
('Cable Rear Delt Fly', 'shoulders', 'horizontal_pull', 'cable', TRUE),
('Machine Rear Delt Fly', 'shoulders', 'horizontal_pull', 'machine', TRUE),
('Face Pull', 'shoulders', 'horizontal_pull', 'cable', TRUE),
('Upright Row', 'shoulders', 'vertical_pull', 'barbell', TRUE),

-- BICEPS
('Barbell Curl', 'biceps', 'vertical_pull', 'barbell', TRUE),
('Dumbbell Curl', 'biceps', 'vertical_pull', 'dumbbell', TRUE),
('Hammer Curl', 'biceps', 'vertical_pull', 'dumbbell', TRUE),
('Preacher Curl', 'biceps', 'vertical_pull', 'machine', TRUE),
('Cable Curl', 'biceps', 'vertical_pull', 'cable', TRUE),
('Incline Dumbbell Curl', 'biceps', 'vertical_pull', 'dumbbell', TRUE),
('Concentration Curl', 'biceps', 'vertical_pull', 'dumbbell', TRUE),
('Zottman Curl', 'biceps', 'vertical_pull', 'dumbbell', TRUE),
('Reverse Curl', 'biceps', 'vertical_pull', 'barbell', TRUE),
('Chin-up', 'biceps', 'vertical_pull', 'bodyweight', TRUE),

-- TRICEPS
('Close-Grip Bench Press', 'triceps', 'horizontal_push', 'barbell', TRUE),
('Tricep Dip', 'triceps', 'vertical_push', 'bodyweight', TRUE),
('Overhead Tricep Extension', 'triceps', 'vertical_push', 'dumbbell', TRUE),
('Cable Tricep Pushdown', 'triceps', 'vertical_push', 'cable', TRUE),
('Skull Crusher', 'triceps', 'vertical_push', 'barbell', TRUE),
('Dumbbell Skull Crusher', 'triceps', 'vertical_push', 'dumbbell', TRUE),
('Diamond Push-up', 'triceps', 'horizontal_push', 'bodyweight', TRUE),
('Tricep Kickback', 'triceps', 'vertical_push', 'dumbbell', TRUE),
('Machine Tricep Extension', 'triceps', 'vertical_push', 'machine', TRUE),
('Cable Overhead Tricep Extension', 'triceps', 'vertical_push', 'cable', TRUE),

-- CALVES
('Standing Calf Raise', 'calves', 'knee_dominant', 'machine', TRUE),
('Seated Calf Raise', 'calves', 'knee_dominant', 'machine', TRUE),
('Donkey Calf Raise', 'calves', 'knee_dominant', 'machine', TRUE),
('Single-Leg Calf Raise', 'calves', 'knee_dominant', 'dumbbell', TRUE),
('Leg Press Calf Raise', 'calves', 'knee_dominant', 'machine', TRUE),

-- ABS / CORE
('Plank', 'abs', 'core', 'bodyweight', TRUE),
('Side Plank', 'abs', 'core', 'bodyweight', TRUE),
('Hanging Leg Raise', 'abs', 'core', 'bodyweight', TRUE),
('Hanging Knee Raise', 'abs', 'core', 'bodyweight', TRUE),
('Cable Crunch', 'abs', 'core', 'cable', TRUE),
('Ab Wheel Rollout', 'abs', 'core', 'dumbbell', TRUE),
('Russian Twist', 'abs', 'core', 'dumbbell', TRUE),
('Dead Bug', 'abs', 'core', 'bodyweight', TRUE),
('Bird Dog', 'abs', 'core', 'bodyweight', TRUE),
('Machine Crunch', 'abs', 'core', 'machine', TRUE),

-- FOREARMS
('Wrist Curl', 'forearms', 'vertical_pull', 'dumbbell', TRUE),
('Reverse Wrist Curl', 'forearms', 'vertical_pull', 'dumbbell', TRUE),
('Farmer''s Walk', 'forearms', 'carry', 'dumbbell', TRUE),
('Plate Pinch', 'forearms', 'carry', 'dumbbell', TRUE),
('Towel Pull-up', 'forearms', 'vertical_pull', 'bodyweight', TRUE);

-- Create a view for easy exercise searching
CREATE OR REPLACE VIEW public.exercise_search AS
SELECT
  id,
  name,
  muscle_group,
  movement_pattern,
  equipment,
  is_builtin,
  user_id,
  -- Search vector for text search
  to_tsvector('english', name || ' ' || muscle_group || ' ' || COALESCE(movement_pattern, '') || ' ' || COALESCE(equipment, '')) AS search_vector
FROM public.exercises;