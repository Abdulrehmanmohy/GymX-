import React, { useState, useEffect } from 'react';
import { Exercise, ThemeMode } from '../../types/gym';
import { Play, Pause, RotateCcw, Flame, CheckCircle, Info, ShieldAlert } from 'lucide-react';

interface WorkoutVisualizerProps {
  exercise: Exercise;
  theme: ThemeMode;
  onClose?: () => void;
}

export const WorkoutVisualizer: React.FC<WorkoutVisualizerProps> = ({
  exercise,
  theme,
  onClose,
}) => {
  const isDark = theme === 'dark';
  const [isPlaying, setIsPlaying] = useState(true);
  const [tempoPhase, setTempoPhase] = useState<'Eccentric (Lowering)' | 'Isometric (Hold)' | 'Concentric (Explode)'>('Eccentric (Lowering)');
  const [phaseSeconds, setPhaseSeconds] = useState(3);
  const [repsDone, setRepsDone] = useState(0);

  // Tempo rhythm loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPhaseSeconds((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // Transition phase
          setTempoPhase((currentPhase) => {
            if (currentPhase === 'Eccentric (Lowering)') {
              return 'Isometric (Hold)';
            } else if (currentPhase === 'Isometric (Hold)') {
              return 'Concentric (Explode)';
            } else {
              setRepsDone((r) => r + 1);
              return 'Eccentric (Lowering)';
            }
          });

          // Reset seconds according to phase
          if (tempoPhase === 'Eccentric (Lowering)') return 1; // hold
          if (tempoPhase === 'Isometric (Hold)') return 1; // explode
          return 3; // lowering
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, tempoPhase]);

  // Primary muscle highlight color based on muscle group
  const getMuscleAccentColor = (group: string) => {
    switch (group) {
      case 'Chest':
        return '#f97316'; // orange
      case 'Back':
        return '#3b82f6'; // blue
      case 'Legs':
        return '#10b981'; // emerald
      case 'Shoulders':
        return '#8b5cf6'; // purple
      case 'Arms':
        return '#ec4899'; // pink
      case 'Core':
        return '#eab308'; // yellow
      default:
        return '#ef4444'; // red
    }
  };

  const accentColor = getMuscleAccentColor(exercise.muscleGroup);

  return (
    <div className="space-y-4">
      {/* Dynamic Exercise Telemetry & Cadence Terminal */}
      <div
        id="exercise-visualizer-stage"
        className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
          isDark
            ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl'
            : 'bg-gradient-to-b from-white to-zinc-50 border-zinc-200 shadow-md'
        }`}
      >
        {/* Top Exercise Header inside Stage */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-xs font-mono uppercase tracking-wider font-extrabold text-zinc-400">
              {exercise.muscleGroup} • {exercise.equipment}
            </span>
          </div>

          <div
            className={`px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${
              isDark
                ? 'bg-zinc-800/80 border-zinc-700 text-accent'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current text-orange-400" />
            <span>Target: {exercise.primaryMuscle}</span>
          </div>
        </div>

        {/* Center Cadence Biomechanics Gauge */}
        <div className="flex flex-col items-center justify-center py-2">
          {/* Circular SVG Cadence Ring */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={isDark ? '#27272a' : '#e4e4e7'}
                strokeWidth="7"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={accentColor}
                strokeWidth="7"
                strokeDasharray={264}
                strokeDashoffset={
                  tempoPhase.startsWith('Eccentric')
                    ? 264 - (264 * (4 - phaseSeconds)) / 3
                    : tempoPhase.startsWith('Isometric')
                    ? 130
                    : 40
                }
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>

            {/* Center Dial Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
                {tempoPhase.split(' ')[0]}
              </span>
              <span className="text-3xl font-black font-mono tracking-tight my-0.5 text-zinc-100 dark:text-white">
                {phaseSeconds}s
              </span>
              <span className="text-[10px] font-medium text-zinc-400">
                {tempoPhase.includes('Lowering')
                  ? 'Controlled Descent'
                  : tempoPhase.includes('Hold')
                  ? 'Peak Contraction'
                  : 'Explosive Drive'}
              </span>
            </div>
          </div>

          {/* Cadence Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-4 text-center">
            <div
              className={`p-2 rounded-xl border ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="text-[10px] text-zinc-400 font-medium">Rep Count</div>
              <div className="text-sm font-black text-accent font-mono">{repsDone} reps</div>
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="text-[10px] text-zinc-400 font-medium">Cadence</div>
              <div className="text-sm font-black text-cyan-400 font-mono">3-1-1</div>
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="text-[10px] text-zinc-400 font-medium">Load Target</div>
              <div className="text-sm font-black text-amber-400 font-mono">{exercise.defaultReps}</div>
            </div>
          </div>
        </div>

        {/* Animation & Audio Playback Controls */}
        <div className="flex items-center gap-3 mt-4 w-full justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all active:scale-95 ${
              isPlaying
                ? 'bg-accent border-accent shadow-accent'
                : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pause Cadence
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Resume Cadence
              </>
            )}
          </button>

          <button
            onClick={() => {
              setRepsDone(0);
              setTempoPhase('Eccentric (Lowering)');
              setPhaseSeconds(3);
            }}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isDark
                ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'border-zinc-300 bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            title="Reset Reps"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Muscle Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-zinc-400">Primary Focus:</span>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: `${accentColor}20`,
            borderColor: `${accentColor}50`,
            color: accentColor,
          }}
        >
          {exercise.primaryMuscle}
        </span>
        {exercise.secondaryMuscles.map((sec) => (
          <span
            key={sec}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              isDark ? 'bg-zinc-800/70 border-zinc-700 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
            }`}
          >
            {sec}
          </span>
        ))}
      </div>

      {/* Step-by-Step Instructions */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-red-500" />
          Step-by-Step Execution
        </h4>
        <ol className="space-y-2 text-xs">
          {exercise.instructions.map((step, idx) => (
            <li
              key={idx}
              className={`p-2.5 rounded-xl border flex items-start gap-2.5 leading-relaxed ${
                isDark ? 'bg-zinc-900/50 border-zinc-800/80 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center shrink-0 font-bold text-[11px]">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Pro Form Tips */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          Pro Biomechanics & Injury Prevention
        </h4>
        <div className="space-y-1.5">
          {exercise.formTips.map((tip, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                isDark ? 'bg-amber-950/20 border border-amber-500/20 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
