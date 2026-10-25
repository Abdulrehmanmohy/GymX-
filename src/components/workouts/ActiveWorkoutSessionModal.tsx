import React, { useState, useEffect } from 'react';
import { WorkoutRoutine, Exercise, ThemeMode, ActiveWorkoutSet, RoutineExercise } from '../../types/gym';
import {
  X,
  Check,
  Disc,
  RefreshCw,
  ShieldCheck,
  Flame,
  TrendingUp,
  Video,
  ChevronDown,
  Flag,
  Heart,
  Timer,
  Minus,
  Plus,
  CheckCircle,
  SkipBack,
  SkipForward,
  Trophy,
  Lock,
  Circle,
} from 'lucide-react';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { ExerciseSwapModal } from './ExerciseSwapModal';
import { WarmUpPyramidModal } from './WarmUpPyramidModal';
import { OneRepMaxModal } from './OneRepMaxModal';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';
import { AnimatedExerciseCanvas } from './AnimatedExerciseCanvas';
import { sounds } from '../../utils/audio';

interface ActiveWorkoutSessionModalProps {
  routine: WorkoutRoutine;
  exercisesMap: Record<string, Exercise>;
  allExercises?: Exercise[];
  theme: ThemeMode;
  onFinishWorkout: (routineName: string, durationMin: number, totalVolume: number) => void;
  onClose: () => void;
}

export const ActiveWorkoutSessionModal: React.FC<ActiveWorkoutSessionModalProps> = ({
  routine,
  exercisesMap,
  allExercises,
  theme,
  onFinishWorkout,
  onClose,
}) => {
  const isDark = theme === 'dark';
  const availableExercisesList = allExercises || Object.values(exercisesMap);

  // Dynamic in-session swapping of exercises
  const [sessionExercises, setSessionExercises] = useState<RoutineExercise[]>(() => [
    ...routine.exercises,
  ]);
  const [dynamicExercisesMap, setDynamicExercisesMap] = useState<Record<string, Exercise>>({
    ...exercisesMap,
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(60);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [liveBpm, setLiveBpm] = useState(156);

  // Problem-solving modals state
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [selectedSetIndexForPlate, setSelectedSetIndexForPlate] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showWarmupModal, setShowWarmupModal] = useState(false);
  const [show1RMModal, setShow1RMModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);

  // Sets state for each exercise
  const [sessionSets, setSessionSets] = useState<Record<string, ActiveWorkoutSet[]>>(() => {
    const map: Record<string, ActiveWorkoutSet[]> = {};
    routine.exercises.forEach((item) => {
      const sets: ActiveWorkoutSet[] = [];
      const defaultRepsNum = parseInt(item.reps) || 10;
      for (let i = 1; i <= item.sets; i++) {
        sets.push({
          setNumber: i,
          reps: defaultRepsNum,
          weightKg: item.targetWeightKg || 50,
          completed: false,
        });
      }
      map[item.exerciseId] = sets;
    });
    return map;
  });

  // Workout duration timer & heart rate oscillation
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      if (Math.random() > 0.6) {
        setLiveBpm(Math.floor(148 + Math.random() * 16));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rest countdown timer
  useEffect(() => {
    if (!isRestTimerActive) return;
    const interval = setInterval(() => {
      setRestSecondsLeft((s) => {
        if (s <= 1) {
          setIsRestTimerActive(false);
          sounds.playTimerBeep();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestTimerActive]);

  const currentRoutineExercise = sessionExercises[currentExerciseIndex];
  const currentExercise = dynamicExercisesMap[currentRoutineExercise?.exerciseId];
  const currentSets = sessionSets[currentRoutineExercise?.exerciseId] || [];

  // Active set is first uncompleted set, or last set
  const activeSetIndex = Math.max(
    0,
    currentSets.findIndex((s) => !s.completed)
  );

  const handleToggleSet = (index: number) => {
    const exId = currentRoutineExercise.exerciseId;
    const newSets = [...currentSets];
    const willBeCompleted = !newSets[index].completed;
    newSets[index] = { ...newSets[index], completed: willBeCompleted };

    setSessionSets((prev) => ({
      ...prev,
      [exId]: newSets,
    }));

    if (willBeCompleted) {
      sounds.playSetSuccess();
      setRestSecondsLeft(currentRoutineExercise.restSec || 60);
      setIsRestTimerActive(true);
    } else {
      sounds.playClick();
    }
  };

  const handleLogActiveSetAndRest = () => {
    if (activeSetIndex !== -1 && activeSetIndex < currentSets.length) {
      handleToggleSet(activeSetIndex);
    } else {
      sounds.playCheckInSuccess();
      setIsRestTimerActive(true);
      setRestSecondsLeft(60);
    }
  };

  const handleUpdateWeight = (setIndex: number, delta: number) => {
    sounds.playClick();
    const exId = currentRoutineExercise.exerciseId;
    const newSets = [...currentSets];
    newSets[setIndex] = {
      ...newSets[setIndex],
      weightKg: Math.max(0, Math.round((newSets[setIndex].weightKg + delta) * 10) / 10),
    };
    setSessionSets((prev) => ({ ...prev, [exId]: newSets }));
  };

  const handleUpdateReps = (setIndex: number, delta: number) => {
    sounds.playClick();
    const exId = currentRoutineExercise.exerciseId;
    const newSets = [...currentSets];
    newSets[setIndex] = {
      ...newSets[setIndex],
      reps: Math.max(1, newSets[setIndex].reps + delta),
    };
    setSessionSets((prev) => ({ ...prev, [exId]: newSets }));
  };

  const handleApplyMicroOverload = () => {
    sounds.playCheckInSuccess();
    const exId = currentRoutineExercise.exerciseId;
    const newSets = currentSets.map((s) => ({
      ...s,
      weightKg: s.completed ? s.weightKg : Math.round((s.weightKg + 2.5) * 10) / 10,
    }));
    setSessionSets((prev) => ({ ...prev, [exId]: newSets }));
  };

  const handleApplyWarmupSets = (warmupSets: ActiveWorkoutSet[]) => {
    const exId = currentRoutineExercise.exerciseId;
    const existingSets = currentSets.filter((s) => !s.isWarmup);
    const renumberedWorkingSets = existingSets.map((s, idx) => ({
      ...s,
      setNumber: warmupSets.length + idx + 1,
    }));
    setSessionSets((prev) => ({
      ...prev,
      [exId]: [...warmupSets, ...renumberedWorkingSets],
    }));
  };

  const handleSwapExercise = (newExercise: Exercise) => {
    sounds.playSetSuccess();
    const oldExId = currentRoutineExercise.exerciseId;
    const newExId = newExercise.id;

    setDynamicExercisesMap((prev) => ({ ...prev, [newExId]: newExercise }));

    setSessionExercises((prev) => {
      const copy = [...prev];
      copy[currentExerciseIndex] = {
        ...copy[currentExerciseIndex],
        exerciseId: newExId,
      };
      return copy;
    });

    if (!sessionSets[newExId]) {
      setSessionSets((prev) => ({
        ...prev,
        [newExId]: prev[oldExId] || [
          { setNumber: 1, reps: 10, weightKg: 40, completed: false },
          { setNumber: 2, reps: 10, weightKg: 40, completed: false },
          { setNumber: 3, reps: 10, weightKg: 40, completed: false },
        ],
      }));
    }
  };

  const handleExtendRest = (seconds: number) => {
    sounds.playClick();
    setRestSecondsLeft((prev) => prev + seconds);
  };

  const calculateTotalVolume = () => {
    let total = 0;
    (Object.values(sessionSets) as ActiveWorkoutSet[][]).forEach((sets) => {
      sets.forEach((s) => {
        if (s.completed) {
          total += s.weightKg * s.reps;
        }
      });
    });
    return total;
  };

  const activeCaloriesBurned = Math.round((elapsedSeconds / 60) * 8.2);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    sounds.playCheckInSuccess();
    const durMins = Math.max(1, Math.round(elapsedSeconds / 60));
    const volume = calculateTotalVolume();
    setIsWorkoutCompleted(true);
    setTimeout(() => {
      onFinishWorkout(routine.name, durMins, volume);
    }, 1400);
  };

  const currentSetWeight = currentSets[selectedSetIndexForPlate]?.weightKg || 80;
  const nextExercise = sessionExercises[currentExerciseIndex + 1]
    ? dynamicExercisesMap[sessionExercises[currentExerciseIndex + 1]?.exerciseId]
    : null;

  return (
    <div
      id="active-workout-session-modal"
      className="fixed inset-0 z-50 flex flex-col bg-black text-zinc-100 animate-in fade-in duration-200 overflow-hidden"
    >
      {/* HUD Sticky Header */}
      <header className="sticky top-0 z-40 bg-black px-4 py-3 flex items-center justify-between border-b border-zinc-800 shadow-2xl">
        {/* Session Minimize Action */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-90 transition-all border border-zinc-800 cursor-pointer"
          type="button"
          title="Minimize Session"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Central Header Exercise Identity & Progress Indicator */}
        <div className="flex flex-col items-center text-center px-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-label-caps text-[10px] tracking-widest text-emerald-400">
              LIVE SESSION
            </span>
          </div>
          <h1 className="font-display text-[16px] leading-tight font-black text-white truncate max-w-[220px]">
            {currentExercise?.name || routine.name}
          </h1>
          <span className="font-label-caps text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
            EXERCISE {currentExerciseIndex + 1} OF {sessionExercises.length} • {currentExercise?.muscleGroup || 'WORKOUT'}
          </span>
        </div>

        {/* Emergency End / Close */}
        <button
          onClick={handleFinish}
          className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-500 active:scale-90 transition-all border border-zinc-800 cursor-pointer"
          type="button"
          title="Complete Workout"
        >
          <Flag className="w-4 h-4" />
        </button>
      </header>

      {/* Main Active Tracking Cockpit Body */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-32 max-w-md mx-auto w-full flex flex-col gap-3.5">
        {/* Live Biometrics Pill Strip (HUD Telemetry with ECG) */}
        <section className="w-full bg-zinc-900 rounded-2xl p-3 border border-zinc-800 shadow-xl">
          <div className="grid grid-cols-3 divide-x divide-zinc-800 items-center text-center">
            {/* Heart Rate & ECG */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="flex items-center gap-1 mb-0.5">
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400 heart-pulse" />
                <span className="font-label-caps text-[9px] text-emerald-400">ZONE 4</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-metric text-lg font-black text-white tracking-tight">
                  {liveBpm}
                </span>
                <span className="font-label-caps text-[8px] text-zinc-400">BPM</span>
              </div>
              {/* Dynamic Mini ECG Waveform */}
              <svg className="w-16 h-3 mt-1 overflow-visible" fill="none" stroke="currentColor" viewBox="0 0 80 14">
                <path
                  className="ecg-path text-emerald-400 stroke-2"
                  d="M0 7 H22 L27 1 L32 13 L37 4 L42 9 L46 7 H80"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Total Burned Energy */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="flex items-center gap-1 mb-0.5">
                <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span className="font-label-caps text-[9px] text-zinc-400">ACTIVE</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-metric text-lg font-black text-white tracking-tight">
                  {activeCaloriesBurned}
                </span>
                <span className="font-label-caps text-[8px] text-zinc-400">KCAL</span>
              </div>
              <span className="font-label-caps text-[8px] text-emerald-400 font-semibold mt-1 bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                +12.4/m
              </span>
            </div>

            {/* Elapsed Session Clock */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="flex items-center gap-1 mb-0.5">
                <Timer className="w-4 h-4 text-zinc-300" />
                <span className="font-label-caps text-[9px] text-zinc-400">ELAPSED</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-metric text-lg font-black text-white tracking-tight">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
              <span className="font-label-caps text-[8px] text-zinc-400 mt-1">PACE OPTIMAL</span>
            </div>
          </div>
        </section>

        {/* Center Dynamic Telemetry Gauge: Circular Countdown Timer & Target */}
        <section className="w-full relative flex flex-col items-center justify-center py-2">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* SVG Dual Telemetry Gauge */}
            <svg className="w-full h-full -rotate-90 transform overflow-visible" viewBox="0 0 200 200">
              {/* Background Tracks */}
              <circle cx="100" cy="100" fill="none" r="82" stroke="#27272a" strokeWidth="8" />
              <circle cx="100" cy="100" fill="none" r="68" stroke="#18181b" strokeWidth="4" />

              {/* Secondary Zone Progress */}
              <circle
                cx="100"
                cy="100"
                fill="none"
                opacity="0.4"
                r="68"
                stroke="#10B981"
                strokeDasharray="427"
                strokeDashoffset="128"
                strokeLinecap="round"
                strokeWidth="4"
              />

              {/* Primary Kinetic Countdown Arc */}
              <circle
                className="ring-glow"
                cx="100"
                cy="100"
                fill="none"
                r="82"
                stroke="#10B981"
                strokeDasharray="515.2"
                strokeDashoffset={isRestTimerActive ? (515.2 * (60 - restSecondsLeft)) / 60 : 0}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>

            {/* Digital HUD Center Readout */}
            <div className="absolute flex flex-col items-center justify-center text-center select-none">
              <span className="font-label-caps text-[10px] text-emerald-400 tracking-widest uppercase">
                {isRestTimerActive ? 'REST INTERVAL' : 'ACTIVE INTERVAL'}
              </span>
              <span className="font-metric text-4xl font-black text-white tracking-tighter my-0.5">
                {isRestTimerActive ? `${restSecondsLeft}s` : formatTimer(elapsedSeconds)}
              </span>
              <div className="flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-full border border-zinc-800 shadow-sm">
                <Flag className="w-3 h-3 text-emerald-400" />
                <span className="font-label-caps text-[10px] font-bold text-white">
                  TARGET: {currentRoutineExercise?.reps || '8-10'} REPS
                </span>
              </div>
            </div>

            {/* Rest Quick Controls */}
            {isRestTimerActive && (
              <>
                <button
                  onClick={() => handleExtendRest(15)}
                  className="absolute -right-2 top-10 bg-zinc-900 hover:bg-zinc-800 text-white font-label-caps text-[11px] px-2.5 py-1 rounded-lg border border-zinc-800 active:scale-95 transition-all shadow-md cursor-pointer"
                  type="button"
                >
                  +15s
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsRestTimerActive(false);
                  }}
                  className="absolute -left-2 top-10 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 font-label-caps text-[11px] px-2 py-1 rounded-lg border border-zinc-800 active:scale-95 transition-all shadow-md cursor-pointer"
                  type="button"
                >
                  SKIP
                </button>
              </>
            )}
          </div>
        </section>

        {/* Problem Solver Rapid Action Strip */}
        <section className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setShowSwapModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Machine Busy? Swap</span>
          </button>

          <button
            onClick={() => {
              setSelectedSetIndexForPlate(activeSetIndex);
              setShowPlateCalc(true);
            }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer"
          >
            <Disc className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plate Math</span>
          </button>

          <button
            onClick={() => setShowWarmupModal(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Warm-Up Sets</span>
          </button>

          <button
            onClick={handleApplyMicroOverload}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-xs font-bold text-emerald-400 active:scale-95 transition-all cursor-pointer font-mono"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>+2.5kg Overload</span>
          </button>
        </section>

        {/* Interactive Set Checklist Table */}
        <section className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider">
              SET LOG & TELEMETRY
            </span>
            <span className="font-label-caps text-[10px] text-emerald-400 font-semibold">
              PREVIOUS PR: {currentRoutineExercise?.targetWeightKg || 85} KG
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {currentSets.map((set, sIdx) => {
              const isActive = sIdx === activeSetIndex && !set.completed;
              const isDone = set.completed;

              if (isActive) {
                // ACTIVE SET HERO HIGHLIGHT WITH TACTICAL STEPPERS
                return (
                  <div
                    key={sIdx}
                    className="relative p-3.5 rounded-2xl bg-zinc-900 border-2 border-emerald-500 shadow-xl shadow-emerald-950/40"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-500 text-white font-label-caps text-xs flex items-center justify-center font-bold">
                          {set.setNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-sm font-black text-white tracking-wide">
                              SET {set.setNumber} ACTIVE
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          </div>
                          <span className="font-label-caps text-[10px] text-emerald-400 font-bold tracking-wider uppercase">
                            WORKING SET • RPE 8.5
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSet(sIdx)}
                        className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-950/50 active:scale-95 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Done</span>
                      </button>
                    </div>

                    {/* Precision Input Wells for Weight & Reps */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Weight Well */}
                      <div className="bg-black rounded-xl p-2 border border-zinc-800">
                        <span className="block font-label-caps text-[9px] text-zinc-400 uppercase mb-1">
                          LOAD (KG)
                        </span>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleUpdateWeight(sIdx, -2.5)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                            type="button"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-metric text-lg font-black text-white">
                            {set.weightKg}
                          </span>
                          <button
                            onClick={() => handleUpdateWeight(sIdx, 2.5)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                            type="button"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Reps Well */}
                      <div className="bg-black rounded-xl p-2 border border-zinc-800">
                        <span className="block font-label-caps text-[9px] text-zinc-400 uppercase mb-1">
                          COMPLETED REPS
                        </span>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleUpdateReps(sIdx, -1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                            type="button"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-metric text-lg font-black text-white">
                            {set.reps}
                          </span>
                          <button
                            onClick={() => handleUpdateReps(sIdx, 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                            type="button"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Completed or Upcoming sets
              return (
                <div
                  key={sIdx}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-zinc-950 border-emerald-500/40 text-zinc-100'
                      : 'bg-zinc-900/50 border-zinc-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleSet(sIdx)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="font-label-caps text-xs">{set.setNumber}</span>
                      )}
                    </button>
                    <div>
                      <span className="font-display text-sm font-bold text-white">
                        SET {set.setNumber}
                      </span>
                      <span className="block font-label-caps text-[10px] text-zinc-400">
                        {isDone ? 'COMPLETED' : 'UPCOMING'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-white">
                        {set.weightKg} <span className="text-xs text-zinc-400">kg</span>
                      </span>
                      <span className="text-zinc-500 text-xs mx-1">×</span>
                      <span className="text-sm font-bold text-white">
                        {set.reps} <span className="text-xs text-zinc-400">reps</span>
                      </span>
                    </div>
                    {isDone ? (
                      <Lock className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Exercise Form Guidance Card with Live Animated Movement */}
        {currentExercise && (
          <section className="w-full bg-zinc-900 rounded-2xl p-3 border border-zinc-800 flex items-center gap-3 mt-1">
            <button
              onClick={() => {
                sounds.playClick();
                setShowTechniqueModal(true);
              }}
              className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-emerald-500/40 bg-black cursor-pointer group active:scale-95 transition-all shadow-md"
              title="Tap to open full animated form demonstration"
            >
              <AnimatedExerciseCanvas
                exercise={currentExercise}
                theme={theme}
                isPlaying={true}
                isSlowMotion={false}
                showTelemetry={false}
                className="w-full h-full"
              />
              <span className="absolute bottom-1 right-1 font-mono text-[7px] bg-black/90 text-emerald-400 px-1 rounded font-bold border border-emerald-500/30">
                FORM
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-label-caps text-[10px] text-emerald-400 font-bold tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  COACHING TECHNIQUE
                </span>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowTechniqueModal(true);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold border border-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Video className="w-3 h-3 text-emerald-400" />
                  <span>View Video</span>
                </button>
              </div>
              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                {currentExercise.executionCue || currentExercise.formTips?.[0] || 'Maintain neutral spine and full range of motion.'}
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Floating Tactical Control HUD (Within thumb reach lower 40%) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 z-50 pointer-events-none">
        <div className="pointer-events-auto bg-black rounded-2xl p-3 border border-zinc-800 shadow-[0_-8px_32px_rgba(0,0,0,0.9)] flex flex-col gap-2">
          {/* Primary Kinetic CTA Action Button */}
          <button
            onClick={handleLogActiveSetAndRest}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-display text-base font-black uppercase py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(16,185,129,0.5)] active:scale-[0.97] transition-all tracking-wider cursor-pointer"
            type="button"
          >
            <CheckCircle className="w-5 h-5 text-black stroke-[2.5]" />
            <span>LOG SET & START REST</span>
          </button>

          {/* Auxiliary Exercise Stepper Navigation Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setCurrentExerciseIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentExerciseIndex === 0}
              className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 hover:text-white py-2 px-3 rounded-xl border border-zinc-800 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <SkipBack className="w-4 h-4" />
              <span className="font-label-caps text-[10px]">PREV EXERCISE</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                if (currentExerciseIndex < sessionExercises.length - 1) {
                  setCurrentExerciseIndex((prev) => prev + 1);
                } else {
                  handleFinish();
                }
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-emerald-400 hover:text-white py-2 px-3 rounded-xl border border-zinc-800 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="font-label-caps text-[10px] truncate">
                {nextExercise ? `NEXT: ${nextExercise.name.split(' ')[0]}` : 'FINISH WORKOUT'}
              </span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Completion Toast Overlay */}
      {isWorkoutCompleted && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-950/60 mb-4 animate-bounce">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black font-display text-white">Workout Crushed!</h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xs font-mono">
            {Math.round(elapsedSeconds / 60)} Mins • {calculateTotalVolume().toLocaleString()} kg Volume • {activeCaloriesBurned} kcal
          </p>
        </div>
      )}

      {/* Problem Solvers Modals */}
      {showPlateCalc && (
        <PlateCalculatorModal
          initialWeightKg={currentSetWeight}
          theme={theme}
          onApplyWeight={(w) => {
            handleUpdateWeight(selectedSetIndexForPlate, w - currentSetWeight);
          }}
          onClose={() => setShowPlateCalc(false)}
        />
      )}

      {showSwapModal && currentExercise && (
        <ExerciseSwapModal
          currentExercise={currentExercise}
          allExercises={availableExercisesList}
          theme={theme}
          onSwap={handleSwapExercise}
          onClose={() => setShowSwapModal(false)}
        />
      )}

      {showWarmupModal && currentExercise && (
        <WarmUpPyramidModal
          workingWeightKg={currentSetWeight}
          exerciseName={currentExercise.name}
          theme={theme}
          onApplyWarmupSets={handleApplyWarmupSets}
          onClose={() => setShowWarmupModal(false)}
        />
      )}

      {show1RMModal && (
        <OneRepMaxModal
          initialWeightKg={currentSetWeight}
          initialReps={currentSets[selectedSetIndexForPlate]?.reps || 8}
          theme={theme}
          onClose={() => setShow1RMModal(false)}
        />
      )}

      {/* FULL ANIMATED TECHNIQUE DEMONSTRATION POPUP */}
      {showTechniqueModal && currentExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-black">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-display font-black text-sm text-white truncate">
                  {currentExercise.name} • Form Guide
                </h3>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowTechniqueModal(false);
                }}
                className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ExerciseVideoPlayer
                exercise={currentExercise}
                theme={theme}
                mode="full"
                autoPlay={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
