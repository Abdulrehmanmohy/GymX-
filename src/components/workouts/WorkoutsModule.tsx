import React, { useState, useMemo } from 'react';
import { Exercise, WorkoutRoutine, MuscleGroup, DifficultyLevel, EquipmentType, ThemeMode } from '../../types/gym';
import {
  Search,
  Filter,
  Play,
  Plus,
  Dumbbell,
  Clock,
  Flame,
  ChevronRight,
  Eye,
  X,
  Video,
  Sparkles,
  CheckCircle2,
  Disc,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Zap,
  ArrowRight,
  Bookmark,
  Shield,
  Layers,
  Activity,
  Target,
  CircleDot,
  BarChart3,
} from 'lucide-react';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';
import { WorkoutVisualizer } from './WorkoutVisualizer';
import { ActiveWorkoutSessionModal } from './ActiveWorkoutSessionModal';
import { CustomRoutineBuilderModal } from './CustomRoutineBuilderModal';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { ExerciseSwapModal } from './ExerciseSwapModal';
import { OneRepMaxModal } from './OneRepMaxModal';
import { WarmUpPyramidModal } from './WarmUpPyramidModal';
import { AnalyticsPerformanceModule } from '../analytics/AnalyticsPerformanceModule';
import { sounds } from '../../utils/audio';

interface WorkoutsModuleProps {
  exerciseLibrary: Exercise[];
  routines: WorkoutRoutine[];
  theme: ThemeMode;
  onSaveRoutine: (newRoutine: WorkoutRoutine) => void;
  onLogCompletedWorkout: (routineName: string, durationMin: number, totalVolume: number) => void;
  initialSubTab?: 'programs' | 'exercises' | 'solvers' | 'analytics';
}

export const WorkoutsModule: React.FC<WorkoutsModuleProps> = ({
  exerciseLibrary,
  routines,
  theme,
  onSaveRoutine,
  onLogCompletedWorkout,
  initialSubTab,
}) => {
  const isDark = theme === 'dark';
  const [activeSubTab, setActiveSubTab] = useState<'programs' | 'exercises' | 'solvers' | 'analytics'>(
    initialSubTab || 'programs'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [inspectExercise, setInspectExercise] = useState<Exercise | null>(null);
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [inspectTab, setInspectTab] = useState<'video' | 'tempo'>('video');

  // Problem solver modal states
  const [showPlateCalcModal, setShowPlateCalcModal] = useState(false);
  const [plateCalcInitialWeight, setPlateCalcInitialWeight] = useState(80);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTargetExercise, setSwapTargetExercise] = useState<Exercise | null>(null);
  const [show1RMModal, setShow1RMModal] = useState(false);
  const [showWarmupModal, setShowWarmupModal] = useState(false);

  // Map of exercises by id
  const exercisesMap = useMemo(() => {
    const map: Record<string, Exercise> = {};
    exerciseLibrary.forEach((ex) => {
      map[ex.id] = ex;
    });
    return map;
  }, [exerciseLibrary]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [exerciseLibrary, searchQuery, selectedMuscle]);

  const categories = ['All', 'Heavy Strength', 'HIIT Shred', 'Mobility & Recovery', 'Hypertrophy', 'Bodyweight'];

  const muscleAnchors = [
    { name: 'Chest', icon: Shield, key: 'Chest' },
    { name: 'Back', icon: Layers, key: 'Back' },
    { name: 'Legs', icon: Activity, key: 'Legs' },
    { name: 'Shoulders', icon: Target, key: 'Shoulders' },
    { name: 'Arms', icon: Dumbbell, key: 'Arms' },
    { name: 'Core', icon: CircleDot, key: 'Core' },
  ];

  return (
    <div id="workouts-module" className="space-y-5 pb-20 animate-fadeIn">
      {/* SECTION: Search Bar HUD & Tags */}
      <section className="flex flex-col gap-2">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises, routines, coaches..."
            className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-11 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          <button
            onClick={() => setShowBuilder(true)}
            className="absolute right-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 active:scale-90 transition-all cursor-pointer"
            title="Create Custom Routine"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Filter Pill Tags (Horizontal Drag Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-label-caps whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/50 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Sub-tab Navigation (Programs vs Exercise Library vs Problem Solvers) */}
      <div className="p-1 rounded-2xl border border-zinc-800 bg-zinc-950 flex items-center gap-1 shadow-md">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('programs');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'programs'
              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Workouts ({routines.length})</span>
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('exercises');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'exercises'
              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Videos ({exerciseLibrary.length})</span>
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('solvers');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeSubTab === 'solvers'
              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Tools</span>
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('analytics');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeSubTab === 'analytics'
              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* VIEW 1: PROGRAMS & CURATED ROUTINES */}
      {activeSubTab === 'programs' && (
        <div className="space-y-5">
          {/* FEATURED HERO PROTOCOL CARD */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider uppercase">
                FEATURED PROTOCOL
              </span>
              <span className="font-label-caps text-[10px] text-emerald-400 flex items-center gap-1">
                TOP RATED <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/50 bg-zinc-900 p-4 shadow-xl">
              {/* Top Row: Badge & Coach */}
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-label-caps text-[10px] tracking-widest font-bold">
                  <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  Trending #1
                </span>
                <div className="flex items-center gap-1.5 text-zinc-400 font-label-caps text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Coach Marcus
                </div>
              </div>

              {/* Title & Specs */}
              <div className="relative z-10 mb-3">
                <h2 className="font-display text-lg font-black text-white leading-tight mb-1">
                  6-Week Powerbuilding Protocol
                </h2>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  High-load compound lifts hybridized with high-volume hypertrophy phases for maximum muscle density and athletic output.
                </p>
              </div>

              {/* Micro Metas Telemetry Row */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black border border-zinc-800 relative z-10 mb-3">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-caps text-[9px] text-zinc-400">FREQUENCY</span>
                  <span className="font-metric text-xs font-bold text-emerald-400">5d / wk</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center border-x border-zinc-800">
                  <span className="font-label-caps text-[9px] text-zinc-400">DURATION</span>
                  <span className="font-metric text-xs font-bold text-white">6 WEEKS</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-caps text-[9px] text-zinc-400">INTENSITY</span>
                  <span className="font-metric text-xs font-bold text-emerald-400">ZONE 4</span>
                </div>
              </div>

              {/* Action CTA */}
              <div className="flex items-center gap-2 relative z-10">
                <button
                  onClick={() => {
                    sounds.playCheckInSuccess();
                    setActiveRoutine(routines[0]);
                  }}
                  className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display text-xs font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  <span>Start Live Protocol</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowBuilder(true)}
                  className="w-11 h-11 rounded-xl border border-zinc-800 bg-zinc-800/80 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition-all cursor-pointer"
                  title="Customize Protocol"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION: Target Muscle Group 6-Anchor Quick Filter Grid */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider uppercase">
                TARGET MUSCLE ANCHORS
              </span>
              <span className="font-label-caps text-[10px] text-emerald-400">6 ANCHORS</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {muscleAnchors.map((anchor) => {
                const isSelected = selectedMuscle === anchor.key;
                return (
                  <button
                    key={anchor.name}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedMuscle(isSelected ? 'All' : anchor.key);
                      setActiveSubTab('exercises');
                    }}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 text-zinc-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center text-emerald-400">
                      <anchor.icon className="w-5 h-5" />
                    </div>
                    <span className="font-label-caps text-[10px] uppercase font-bold">{anchor.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION: Curated Workouts Catalog Cards */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider uppercase">
                CURATED WORKOUT CATALOG
              </span>
              <span className="font-label-caps text-[10px] text-zinc-400">
                {routines.length} AVAILABLE
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-emerald-500/60 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-col">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 font-mono">
                        <Flame className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                        {routine.difficulty} • {routine.focus.split(',')[0]}
                      </span>
                      <h3 className="font-display text-base font-bold text-white leading-snug">
                        {routine.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{routine.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playCheckInSuccess();
                        setActiveRoutine(routine);
                      }}
                      className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-950/50 active:scale-90 transition-all shrink-0 cursor-pointer"
                      title="Start Workout"
                    >
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                  </div>

                  {/* Metrics Pill HUD */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1 text-white">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {routine.durationMin} min
                    </span>
                    <span className="flex items-center gap-1 text-white">
                      <Flame className="w-3.5 h-3.5 text-emerald-400" />
                      {routine.exercises.length * 90} kcal
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black text-zinc-300 text-[10px] font-bold">
                      {routine.exercises.length} Exercises
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* VIEW 2: EXERCISE DIRECTORY & 3-5s VIDEOS */}
      {activeSubTab === 'exercises' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
            <span>Showing {filteredExercises.length} Exercises</span>
            {selectedMuscle !== 'All' && (
              <button
                onClick={() => setSelectedMuscle('All')}
                className="text-emerald-400 hover:underline font-bold"
              >
                Clear Muscle Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900 hover:border-emerald-500/70 shadow-md transition-all flex flex-col justify-between"
              >
                {/* 3-5s Video Player Preview Card */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <ExerciseVideoPlayer
                    exercise={exercise}
                    theme={theme}
                    mode="compact"
                    autoPlay={true}
                  />
                </div>

                <div className="p-3.5 space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                        {exercise.muscleGroup}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-zinc-300 border border-zinc-800">
                        {exercise.equipment}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-white">{exercise.name}</h3>
                    {exercise.executionCue && (
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {exercise.executionCue}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSwapTargetExercise(exercise);
                        setShowSwapModal(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold flex items-center gap-1 border border-zinc-700 transition-all cursor-pointer"
                      title="See machine alternatives"
                    >
                      <RefreshCw className="w-3 h-3 text-emerald-400" />
                      <span>Alternatives</span>
                    </button>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setInspectExercise(exercise);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Form Guide</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: PROBLEM SOLVERS HUB */}
      {activeSubTab === 'solvers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="font-label-caps text-[10px] text-emerald-400 tracking-widest uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              SOLVING REAL GYM PAIN POINTS
            </span>
            <h2 className="text-base font-black font-display text-white">Athletic Problem-Solving Tools</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Designed specifically for real gym conditions: crowded machines, sweaty hands, mental plate math fatigue, and injury prevention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tool 1: Barbell Plate Math Calculator */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-950/50">
                  <Disc className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Barbell Plate Calculator</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Eliminates sweaty brain fog. Shows exact color-coded plate count per side on Olympic barbell with 0 math errors.
                </p>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setPlateCalcInitialWeight(80);
                  setShowPlateCalcModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <span>Open Plate Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tool 2: Machine Occupied? Smart Exercise Swap */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-950/50">
                  <RefreshCw className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Machine Busy? Exercise Swapper</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Someone hogging the bench or cable machine? Instant biomechanical replacements for the same muscle group without losing routine flow.
                </p>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setSwapTargetExercise(exerciseLibrary[0] || null);
                  setShowSwapModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <span>Find Exercise Alternative</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tool 3: 1-Rep Max & Hypertrophy Working Zones */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-950/50">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-sm font-extrabold text-white">1RM & Strength Zones Calculator</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Know your peak 1-rep maximum safely. Generates exact working weights for hypertrophy (75%), strength (85%), and volume (70%).
                </p>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShow1RMModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <span>Calculate 1RM & Percentages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tool 4: Warm-Up Pyramid Generator */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-950/50">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Injury-Prevention Warm-Up Ramp</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Stops joint strains and muscle tears. Calculates progressive warm-up sets (Bar → 50% → 70% → 85%) before working weight.
                </p>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowWarmupModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <span>Build Warm-Up Sets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: ANALYTICS, RECOVERY & PRS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4 animate-fadeIn">
          <AnalyticsPerformanceModule
            theme={theme}
            onOpenLiveWorkout={() => {
              if (routines.length > 0) setActiveRoutine(routines[0]);
            }}
          />
        </div>
      )}

      {/* EXERCISE DETAIL & 3-5s VIDEO DEMO MODAL */}
      {inspectExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 animate-in fade-in">
          <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-black">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Video className="w-3 h-3" /> 3-5 Second Form Video Demonstration
                </span>
                <h3 className="font-black text-base truncate font-display text-white">{inspectExercise.name}</h3>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setInspectExercise(null);
                }}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-zinc-800 bg-zinc-900 p-1 gap-1">
              <button
                onClick={() => setInspectTab('video')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inspectTab === 'video'
                    ? 'bg-emerald-500 text-white shadow-sm font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>3-5s Form Video & Steps</span>
              </button>
              <button
                onClick={() => setInspectTab('tempo')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inspectTab === 'tempo'
                    ? 'bg-emerald-500 text-white shadow-sm font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Cadence & Tempo Gauge</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {inspectTab === 'video' ? (
                <ExerciseVideoPlayer
                  exercise={inspectExercise}
                  theme={theme}
                  mode="full"
                  autoPlay={true}
                />
              ) : (
                <WorkoutVisualizer exercise={inspectExercise} theme={theme} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE WORKOUT SESSION MODAL */}
      {activeRoutine && (
        <ActiveWorkoutSessionModal
          routine={activeRoutine}
          exercisesMap={exercisesMap}
          allExercises={exerciseLibrary}
          theme={theme}
          onFinishWorkout={(routineName, durationMin, totalVolume) => {
            onLogCompletedWorkout(routineName, durationMin, totalVolume);
            setActiveRoutine(null);
          }}
          onClose={() => setActiveRoutine(null)}
        />
      )}

      {/* CUSTOM ROUTINE BUILDER MODAL */}
      {showBuilder && (
        <CustomRoutineBuilderModal
          exerciseLibrary={exerciseLibrary}
          theme={theme}
          onSaveRoutine={onSaveRoutine}
          onClose={() => setShowBuilder(false)}
        />
      )}

      {/* STANDALONE BARBELL PLATE CALCULATOR MODAL */}
      {showPlateCalcModal && (
        <PlateCalculatorModal
          initialWeightKg={plateCalcInitialWeight}
          theme={theme}
          onClose={() => setShowPlateCalcModal(false)}
        />
      )}

      {/* STANDALONE EXERCISE SWAP MODAL */}
      {showSwapModal && (
        <ExerciseSwapModal
          currentExercise={swapTargetExercise || exerciseLibrary[0]}
          allExercises={exerciseLibrary}
          theme={theme}
          onSwap={(newEx) => {
            setInspectExercise(newEx);
            setShowSwapModal(false);
          }}
          onClose={() => setShowSwapModal(false)}
        />
      )}

      {/* STANDALONE 1-REP MAX MODAL */}
      {show1RMModal && (
        <OneRepMaxModal
          initialWeightKg={80}
          initialReps={8}
          theme={theme}
          onClose={() => setShow1RMModal(false)}
        />
      )}

      {/* STANDALONE WARM-UP PYRAMID MODAL */}
      {showWarmupModal && (
        <WarmUpPyramidModal
          workingWeightKg={85}
          exerciseName="Barbell Compound Lift"
          theme={theme}
          onClose={() => setShowWarmupModal(false)}
        />
      )}
    </div>
  );
};
