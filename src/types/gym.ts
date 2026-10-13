export type ThemeMode = 'dark' | 'light';

export type UserRole = 'member' | 'owner';

export type ActiveTab = 'workouts' | 'planner' | 'analytics' | 'scanner' | 'diet' | 'attendance';

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type EquipmentType = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cables' | 'Bodyweight' | 'Kettlebell';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: DifficultyLevel;
  equipment: EquipmentType;
  primaryMuscle: string;
  secondaryMuscles: string[];
  description: string;
  instructions: string[];
  formTips: string[];
  animationKey: string;
  videoUrl?: string;
  videoPoster?: string;
  videoDurationSec?: number;
  executionCue?: string;
  defaultSets: number;
  defaultReps: string;
  defaultRestSec: number;
  substituteExerciseIds?: string[];
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  targetWeightKg?: number;
  restSec: number;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  focus: string;
  difficulty: DifficultyLevel;
  durationMin: number;
  exercises: RoutineExercise[];
  isCustom?: boolean;
}

export interface ActiveWorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  isWarmup?: boolean;
  rpe?: number;
}

export interface ActiveExerciseSession {
  exerciseId: string;
  sets: ActiveWorkoutSet[];
}

export interface WorkoutLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  routineName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  totalVolumeKg: number;
}

export interface ScheduledTask {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'workout' | 'rest' | 'cardio' | 'nutrition' | 'stretch';
  time?: string;
  completed: boolean;
  notes?: string;
  routineId?: string;
}

export interface SmartNotification {
  id: string;
  title: string;
  body: string;
  time: string; // e.g. "07:00 AM"
  category: 'workout' | 'nutrition' | 'water' | 'recovery';
  enabled: boolean;
  frequency: 'Daily' | 'Weekdays' | 'Workout Days';
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id: string;
  time: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source?: 'manual' | 'ai_scanner';
  imageUri?: string;
  items?: FoodItem[];
}

export interface AIScanResult {
  dishName: string;
  confidence: string;
  servingSize: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  nutritionScore: number;
  category: string;
  athleticInsight: string;
  items: FoodItem[];
  isSimulated?: boolean;
  errorNotice?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  avatarUrl: string;
  timestamp: string; // ISO
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM AM/PM
  checkInMethod: 'QR_CODE' | 'MANUAL' | 'BIOMETRIC';
  status: 'Checked-In' | 'Completed' | 'Checked-Out';
  durationMins?: number;
}

export interface GymMember {
  id: string;
  name: string;
  email: string;
  membershipId: string;
  membershipTier: 'Black Onyx VIP' | 'Pro Athlete' | 'Standard Access';
  avatarUrl: string;
  joinDate: string;
  status: 'Active' | 'Expiring Soon' | 'Suspended';
  currentStreak: number;
  bestStreak: number;
  totalVisits: number;
  lastCheckIn?: string;
  qrToken: string;
  isCurrentlyInside?: boolean;
}
