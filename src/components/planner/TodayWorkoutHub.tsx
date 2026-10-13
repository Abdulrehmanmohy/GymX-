import React, { useState } from 'react';
import { WorkoutRoutine, ScheduledTask, ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';

interface TodayWorkoutHubProps {
  routine: WorkoutRoutine;
  scheduledTasks: ScheduledTask[];
  theme: ThemeMode;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  onOpen1RMModal: () => void;
  onOpenPlateCalc: () => void;
  onOpenWarmupModal: () => void;
  onToggleTaskComplete: (taskId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const TodayWorkoutHub: React.FC<TodayWorkoutHubProps> = ({
  routine,
  scheduledTasks,
  theme,
  onStartWorkout,
  onOpen1RMModal,
  onOpenPlateCalc,
  onOpenWarmupModal,
  onToggleTaskComplete,
}) => {
  // Hydration state
  const [waterMl, setWaterMl] = useState<number>(2400);
  const targetWaterMl = 3000;
  const waterPercent = Math.min(100, Math.round((waterMl / targetWaterMl) * 100));

  const todayIso = new Date().toISOString().split('T')[0];
  const todayTasks = scheduledTasks.filter((t) => t.date === todayIso);
  const displayTasks = todayTasks.length > 0 ? todayTasks : scheduledTasks.slice(0, 4);

  const handleAddWater = () => {
    sounds.playClick();
    setWaterMl((prev) => Math.min(4500, prev + 250));
  };

  return (
    <div id="today-workout-hub" className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Welcome & Readiness */}
      <section className="flex justify-between items-end pt-1">
        <div>
          <span className="font-label-caps text-[10px] text-emerald-400 tracking-widest uppercase block font-bold">
            ATHLETE COCKPIT // READY
          </span>
          <h1 className="font-display text-2xl font-black text-white tracking-tight mt-0.5">
            Today's <span className="text-emerald-400">Workout</span>
          </h1>
        </div>
        <div className="text-right pb-1">
          <span className="font-label-caps text-[10px] text-zinc-400 block uppercase">
            ENERGY READINESS
          </span>
          <div className="flex items-center justify-end gap-1 text-emerald-400">
            <span className="material-symbols-outlined text-sm material-symbols-fill">bolt</span>
            <span className="font-metric text-xl font-bold leading-none">94%</span>
          </div>
        </div>
      </section>

      {/* EASY-TO-USE HERO START WORKOUT CARD */}
      <section className="relative rounded-2xl p-4 bg-zinc-950 border-2 border-emerald-500/60 shadow-2xl overflow-hidden">
        {/* Subtle Top Glow */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-label-caps text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              RECOMMENDED TODAY
            </span>
          </div>
          <span className="font-mono text-xs text-zinc-300 font-bold">
            {routine.exercises.length} Exercises
          </span>
        </div>

        <div className="flex gap-3.5 items-center mb-4">
          {/* Routine Visual */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-700 bg-black shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80"
              alt="Active Workout"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-1 left-1 flex items-center gap-0.5 text-emerald-400">
              <span className="material-symbols-outlined text-xs material-symbols-fill">
                fitness_center
              </span>
              <span className="text-[9px] font-bold font-mono">LIVE</span>
            </div>
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base text-white font-black truncate leading-tight">
              {routine.name}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{routine.focus}</p>
            <div className="flex items-center gap-3 mt-2 font-mono text-[11px] text-zinc-300">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-emerald-400">timer</span>
                {routine.durationMin} mins
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-emerald-400">
                  local_fire_department
                </span>
                ~380 kcal
              </span>
            </div>
          </div>
        </div>

        {/* 1-TAP BIG START WORKOUT BUTTON - SUPER EASY TO USE */}
        <button
          onClick={() => {
            sounds.playCheckInSuccess();
            onStartWorkout(routine);
          }}
          className="w-full py-4 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-950/60"
        >
          <span className="material-symbols-outlined text-2xl material-symbols-fill">play_arrow</span>
          <span>START WORKOUT NOW</span>
          <span className="ml-1 text-[11px] font-mono opacity-80 font-bold bg-black/20 px-2 py-0.5 rounded-md">
            1-TAP
          </span>
        </button>
      </section>

      {/* QUICK GYM PROBLEM SOLVERS - 1-TAP ACTION TILES */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-label-caps text-[11px] text-zinc-400 uppercase tracking-wider">
            QUICK GYM TOOLS
          </h2>
          <span className="font-label-caps text-[10px] text-emerald-400 font-bold">1-TAP HELPER</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Plate Calculator */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenPlateCalc();
            }}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 active:scale-95 transition-all text-left flex items-start gap-2.5 cursor-pointer shadow-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <span className="material-symbols-outlined text-lg">disc_full</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">Barbell Plate Math</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Exact plates per side</span>
            </div>
          </button>

          {/* Warmup Pyramid */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenWarmupModal();
            }}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 active:scale-95 transition-all text-left flex items-start gap-2.5 cursor-pointer shadow-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <span className="material-symbols-outlined text-lg">shield</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">Warm-Up Sets</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Prevent gym injury</span>
            </div>
          </button>

          {/* 1RM Calculator */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpen1RMModal();
            }}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 active:scale-95 transition-all text-left flex items-start gap-2.5 cursor-pointer shadow-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <span className="material-symbols-outlined text-lg">calculate</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">1RM & PR Math</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Target weights</span>
            </div>
          </button>

          {/* Quick Hydration Log */}
          <button
            onClick={handleAddWater}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 active:scale-95 transition-all text-left flex items-start gap-2.5 cursor-pointer shadow-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <span className="material-symbols-outlined text-lg">water_drop</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">+250ml Water</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">{(waterMl / 1000).toFixed(1)}L / 3.0L</span>
            </div>
          </button>
        </div>
      </section>

      {/* ACTIVITY & CALORIES PROGRESS */}
      <section className="rounded-2xl p-4 bg-zinc-900 border border-zinc-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <h2 className="font-label-caps text-[10px] text-zinc-300 uppercase tracking-wider font-bold">
              DAILY RECOVERY & ACTIVITY
            </h2>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            OPTIMAL ZONE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase">CALORIES</span>
            <span className="font-mono text-base font-black text-white block my-0.5">1,840</span>
            <span className="text-[9px] text-emerald-400 font-mono">+12% vs yest</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase">HEART RATE</span>
            <span className="font-mono text-base font-black text-emerald-400 block my-0.5">78 bpm</span>
            <span className="text-[9px] text-zinc-400 font-mono">Resting</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black border border-zinc-800">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase">HYDRATION</span>
            <span className="font-mono text-base font-black text-white block my-0.5">{waterPercent}%</span>
            <span className="text-[9px] text-emerald-400 font-mono">{(waterMl / 1000).toFixed(1)}L done</span>
          </div>
        </div>
      </section>

      {/* TODAY'S SCHEDULED TIMETABLE */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-label-caps text-[11px] text-zinc-400 uppercase tracking-wider">
            TODAY'S SCHEDULE
          </h2>
          <span className="font-label-caps text-[10px] text-emerald-400 font-bold">TIMETABLE</span>
        </div>

        <div className="flex flex-col gap-2">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-black flex flex-col items-center justify-center text-center shrink-0 border border-zinc-800">
                  <span className="font-mono text-[8px] text-zinc-400">PLAN</span>
                  <span className="font-mono text-xs text-emerald-400 font-bold leading-none">
                    {task.time?.split(' ')[0] || '17:00'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        task.completed ? 'line-through text-zinc-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      {task.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{task.notes || 'Gym workout session'}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  onToggleTaskComplete(task.id);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  task.completed
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title={task.completed ? 'Completed' : 'Mark complete'}
              >
                <span className="material-symbols-outlined text-base">
                  {task.completed ? 'check' : 'check_box_outline_blank'}
                </span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
