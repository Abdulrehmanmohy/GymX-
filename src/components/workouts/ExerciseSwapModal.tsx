import React, { useMemo } from 'react';
import { X, RefreshCw, Dumbbell, ShieldAlert, Check, ArrowRight, Zap } from 'lucide-react';
import { Exercise, ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';

interface ExerciseSwapModalProps {
  currentExercise: Exercise;
  allExercises: Exercise[];
  theme: ThemeMode;
  onSwap: (newExercise: Exercise) => void;
  onClose: () => void;
}

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  currentExercise,
  allExercises,
  theme,
  onSwap,
  onClose,
}) => {
  const isDark = theme === 'dark';

  // Find candidate alternatives
  const alternatives = useMemo(() => {
    // 1. Direct substitutes from metadata if present
    const directIds = currentExercise.substituteExerciseIds || [];
    const directMatches = allExercises.filter(
      (ex) => directIds.includes(ex.id) && ex.id !== currentExercise.id
    );

    // 2. Same muscle group with different equipment
    const muscleMatches = allExercises.filter(
      (ex) =>
        ex.muscleGroup === currentExercise.muscleGroup &&
        ex.id !== currentExercise.id &&
        !directIds.includes(ex.id)
    );

    return [...directMatches, ...muscleMatches].slice(0, 6);
  }, [currentExercise, allExercises]);

  const handleSelect = (ex: Exercise) => {
    sounds.playSetSuccess();
    onSwap(ex);
    onClose();
  };

  return (
    <div
      id="exercise-swap-modal"
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
              <RefreshCw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Zap className="w-3 h-3 fill-emerald-400" />
                GYM PROBLEM SOLVER
              </span>
              <h2 className="text-base font-black font-display text-white">Equipment Busy? Swap Exercise</h2>
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
          {/* Current Busy Equipment Notice */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Currently Occupied Station
              </span>
              <h3 className="text-sm font-extrabold text-white mt-0.5">{currentExercise.name}</h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {currentExercise.muscleGroup} • {currentExercise.equipment}
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono">
              Occupied
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>Select any available station below to keep your workout moving:</span>
          </div>

          {/* List of Direct Substitutes */}
          <div className="space-y-2.5">
            {alternatives.length > 0 ? (
              alternatives.map((alt) => {
                const isDifferentEquipment = alt.equipment !== currentExercise.equipment;

                return (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                          {alt.equipment}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {alt.difficulty}
                        </span>
                        {isDifferentEquipment && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">
                            Alternative Station
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                        {alt.name}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {alt.executionCue || alt.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelect(alt)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <span>Swap Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4 font-mono">
                No direct alternatives found.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-end bg-zinc-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
