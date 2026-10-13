import React, { useState, useMemo } from 'react';
import { X, Flame, Shield, HelpCircle, Check, Activity, Dumbbell } from 'lucide-react';
import { ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';

interface OneRepMaxModalProps {
  initialWeightKg?: number;
  initialReps?: number;
  theme: ThemeMode;
  onClose: () => void;
}

export const OneRepMaxModal: React.FC<OneRepMaxModalProps> = ({
  initialWeightKg = 80,
  initialReps = 8,
  theme,
  onClose,
}) => {
  const isDark = theme === 'dark';
  const [weightKg, setWeightKg] = useState<number>(initialWeightKg || 80);
  const [reps, setReps] = useState<number>(initialReps || 8);
  const [rpe, setRpe] = useState<number>(8.5); // Rate of Perceived Exertion (8.5 = 1-2 reps in reserve)

  // Calculate 1RM using Epley & Brzycki formulas
  const { epley1RM, brzycki1RM, avg1RM, percentageZones } = useMemo(() => {
    const w = Math.max(1, weightKg);
    const r = Math.max(1, reps);

    // If reps is 1, max is the weight itself
    if (r === 1) {
      const avg = Math.round(w);
      return {
        epley1RM: avg,
        brzycki1RM: avg,
        avg1RM: avg,
        percentageZones: buildZones(avg),
      };
    }

    // Epley: w * (1 + r / 30)
    const epley = Math.round(w * (1 + r / 30));
    // Brzycki: w / (1.0278 - 0.0278 * r)
    const brzycki = Math.round(w / (1.0278 - 0.0278 * r));
    const avg = Math.round((epley + brzycki) / 2);

    return {
      epley1RM: epley,
      brzycki1RM: brzycki,
      avg1RM: avg,
      percentageZones: buildZones(avg),
    };
  }, [weightKg, reps]);

  function buildZones(maxWeight: number) {
    return [
      { percent: 100, reps: '1 rep', weight: Math.round(maxWeight), focus: 'True 1RM Max Effort', tag: 'Max' },
      { percent: 92.5, reps: '2-3 reps', weight: Math.round(maxWeight * 0.925), focus: 'Heavy Peak Strength', tag: 'Strength' },
      { percent: 85, reps: '5-6 reps', weight: Math.round(maxWeight * 0.85), focus: 'Strength & Power Density', tag: 'Power' },
      { percent: 80, reps: '7-8 reps', weight: Math.round(maxWeight * 0.80), focus: 'Power Hypertrophy', tag: 'Growth' },
      { percent: 75, reps: '8-10 reps', weight: Math.round(maxWeight * 0.75), focus: 'Hypertrophy Sweet Spot', tag: 'Prime' },
      { percent: 70, reps: '10-12 reps', weight: Math.round(maxWeight * 0.70), focus: 'Volume & Sarcoplasmic Pump', tag: 'Pump' },
      { percent: 65, reps: '12-15 reps', weight: Math.round(maxWeight * 0.65), focus: 'Endurance & Joint Flushing', tag: 'Stamina' },
    ];
  }

  const handleStepWeight = (delta: number) => {
    sounds.playClick();
    setWeightKg((prev) => Math.max(5, Math.round((prev + delta) * 10) / 10));
  };

  const handleStepReps = (delta: number) => {
    sounds.playClick();
    setReps((prev) => Math.max(1, Math.min(25, prev + delta)));
  };

  return (
    <div
      id="one-rep-max-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 animate-in fade-in"
    >
      <div
        className={`w-full max-w-lg rounded-3xl border flex flex-col max-h-[92vh] overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-black'
            : 'bg-white border-zinc-300 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-950/50">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">
                GYM PROBLEM SOLVER
              </span>
              <h2 className="text-base font-black font-display text-white">1-Rep Max & Strength Zones</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Input Controls Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Weight Lifted */}
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">
                Weight Lifted (kg)
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleStepWeight(-2.5)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono font-black text-xl text-white w-14 text-center">
                  {weightKg}
                </span>
                <button
                  onClick={() => handleStepWeight(2.5)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reps Completed */}
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">
                Reps Performed
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleStepReps(-1)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono font-black text-xl text-white w-10 text-center">
                  {reps}
                </span>
                <button
                  onClick={() => handleStepReps(1)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* ESTIMATED 1RM HERO BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950 via-zinc-950 to-zinc-900 border-2 border-emerald-500/80 shadow-xl shadow-emerald-950/40 text-center space-y-1">
            <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">
              THEORETICAL ONE REP MAXIMUM (1RM)
            </span>
            <div className="text-4xl font-black font-mono text-white tracking-tight">
              {avg1RM} <span className="text-lg font-bold text-emerald-400">kg</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Epley: {epley1RM}kg • Brzycki: {brzycki1RM}kg
            </p>
          </div>

          {/* TRAINING PERCENTAGE ZONES TABLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-300 uppercase tracking-wider font-mono">
                Working Weight Targets By Rep Range
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Scientific Guidelines</span>
            </div>

            <div className="space-y-1.5">
              {percentageZones.map((zone) => (
                <div
                  key={zone.percent}
                  className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-11 font-mono text-xs font-black text-emerald-400">
                      {zone.percent}%
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{zone.focus}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{zone.reps}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-white">
                      {zone.weight} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RPE Scale Explanation */}
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1.5 font-mono">
            <div className="flex items-center gap-1.5 font-bold text-zinc-300 uppercase">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>RPE (Rate of Perceived Exertion) Guide</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              • <strong className="text-white">RPE 10:</strong> Absolute limit (0 reps left in reserve).
              <br />• <strong className="text-white">RPE 9:</strong> Could maybe grind 1 more rep.
              <br />• <strong className="text-white">RPE 8:</strong> Ideal working hypertrophy (2 reps in reserve).
              <br />• <strong className="text-white">RPE 7:</strong> Explosive bar speed (3 reps in reserve).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-end bg-zinc-950">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs transition-colors cursor-pointer font-display"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
