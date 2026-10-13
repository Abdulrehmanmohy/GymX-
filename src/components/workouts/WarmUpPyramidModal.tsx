import React, { useMemo } from 'react';
import { X, ShieldCheck, ArrowRight, Flame, AlertCircle } from 'lucide-react';
import { ThemeMode, ActiveWorkoutSet } from '../../types/gym';
import { sounds } from '../../utils/audio';

interface WarmUpPyramidModalProps {
  workingWeightKg: number;
  exerciseName: string;
  theme: ThemeMode;
  onApplyWarmupSets?: (warmupSets: ActiveWorkoutSet[]) => void;
  onClose: () => void;
}

export const WarmUpPyramidModal: React.FC<WarmUpPyramidModalProps> = ({
  workingWeightKg,
  exerciseName,
  theme,
  onApplyWarmupSets,
  onClose,
}) => {
  const isDark = theme === 'dark';

  const warmups = useMemo(() => {
    const target = Math.max(20, workingWeightKg || 80);

    const step1 = {
      step: 1,
      percent: 'Bar',
      weight: 20,
      reps: 10,
      purpose: 'Joint lubrication & movement pattern groove',
      rest: '45s',
    };

    const step2Weight = Math.round((target * 0.5) / 2.5) * 2.5;
    const step2 = {
      step: 2,
      percent: '50%',
      weight: Math.max(20, step2Weight),
      reps: 5,
      purpose: 'Accelerate bar speed & neuromuscular prep',
      rest: '60s',
    };

    const step3Weight = Math.round((target * 0.7) / 2.5) * 2.5;
    const step3 = {
      step: 3,
      percent: '70%',
      weight: Math.max(25, step3Weight),
      reps: 3,
      purpose: 'High-threshold motor unit recruitment',
      rest: '75s',
    };

    const step4Weight = Math.round((target * 0.85) / 2.5) * 2.5;
    const step4 = {
      step: 4,
      percent: '85%',
      weight: Math.max(30, step4Weight),
      reps: 1,
      purpose: 'Heavy potentiation single (zero lactic acid)',
      rest: '90s',
    };

    return [step1, step2, step3, step4];
  }, [workingWeightKg]);

  const handleApply = () => {
    if (!onApplyWarmupSets) return;
    sounds.playSetSuccess();
    const setsToInsert: ActiveWorkoutSet[] = warmups.map((w, idx) => ({
      setNumber: idx + 1,
      reps: w.reps,
      weightKg: w.weight,
      completed: false,
      isWarmup: true,
    }));
    onApplyWarmupSets(setsToInsert);
    onClose();
  };

  return (
    <div
      id="warmup-pyramid-modal"
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
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">
                INJURY PREVENTION
              </span>
              <h2 className="text-base font-black font-display text-white">Warm-Up Pyramid Calculator</h2>
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
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Heavy Working Weight Target
              </span>
              <h3 className="text-base font-extrabold text-white mt-0.5">{exerciseName}</h3>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black border border-emerald-500/60 font-mono text-base font-black text-emerald-400">
              {workingWeightKg} kg
            </div>
          </div>

          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            Never dive straight into your working weight. Follow these 4 calibrated progressive ramp sets to fire your central nervous system without fatiguing muscle fibers:
          </p>

          {/* Warmup Steps */}
          <div className="space-y-2.5">
            {warmups.map((w) => (
              <div
                key={w.step}
                className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-xs flex items-center justify-center">
                    W{w.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-white">
                        {w.weight} kg × {w.reps} reps
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {w.percent}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{w.purpose}</p>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-zinc-400">
                  Rest: {w.rest}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2 text-xs font-mono text-zinc-300">
            <Flame className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Warm-up sets do not count toward your working volume fatigue. Keep bar velocity high and rest ~60-90s before your 1st working set.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3 bg-zinc-950">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          {onApplyWarmupSets && (
            <button
              onClick={handleApply}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer font-display"
            >
              <span>Add Warm-Up Sets to Workout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
