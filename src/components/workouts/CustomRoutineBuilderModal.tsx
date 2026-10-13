import React, { useState } from 'react';
import { Exercise, WorkoutRoutine, DifficultyLevel, ThemeMode } from '../../types/gym';
import { X, Plus, Trash2, Check, Dumbbell } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface CustomRoutineBuilderModalProps {
  exerciseLibrary: Exercise[];
  theme: ThemeMode;
  onSaveRoutine: (newRoutine: WorkoutRoutine) => void;
  onClose: () => void;
}

export const CustomRoutineBuilderModal: React.FC<CustomRoutineBuilderModalProps> = ({
  exerciseLibrary,
  theme,
  onSaveRoutine,
  onClose,
}) => {
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [durationMin, setDurationMin] = useState(45);
  const [selectedExercises, setSelectedExercises] = useState<
    { exerciseId: string; sets: number; reps: string; restSec: number }[]
  >([]);
  const [showAddPicker, setShowAddPicker] = useState(false);

  const handleAddExercise = (exercise: Exercise) => {
    sounds.playClick();
    setSelectedExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        sets: exercise.defaultSets || 3,
        reps: exercise.defaultReps || '10-12',
        restSec: exercise.defaultRestSec || 60,
      },
    ]);
    setShowAddPicker(false);
  };

  const handleRemoveItem = (index: number) => {
    sounds.playClick();
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, val: any) => {
    setSelectedExercises((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedExercises.length === 0) return;
    sounds.playSetSuccess();

    const newRoutine: WorkoutRoutine = {
      id: `custom-routine-${Date.now()}`,
      name: name.trim(),
      description: `Custom routine focusing on ${focus || 'total strength'}.`,
      focus: focus || 'Full Body',
      difficulty,
      durationMin,
      exercises: selectedExercises,
      isCustom: true,
    };

    onSaveRoutine(newRoutine);
    onClose();
  };

  return (
    <div
      id="custom-routine-builder-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 animate-in fade-in"
    >
      <div
        className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-zinc-950/90'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-display">Routine Builder</h3>
              <p className="text-[11px] text-zinc-400">Design your personalized gym split</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Routine Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Routine Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Upper Body Hypertrophy Blitz"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-zinc-850 border-zinc-700 text-white placeholder-zinc-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>

          {/* Muscle Focus & Estimated Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Target Focus
              </label>
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. Chest & Triceps"
                className={`w-full px-3 py-2 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-zinc-850 border-zinc-700 text-white placeholder-zinc-500'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="10"
                max="180"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-zinc-850 border-zinc-700 text-white'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    difficulty === lvl
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30'
                      : isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-600'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Exercises List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Exercises ({selectedExercises.length}) *
              </label>
              <button
                type="button"
                onClick={() => setShowAddPicker(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1 hover:bg-emerald-400/25 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Exercise
              </button>
            </div>

            {selectedExercises.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-zinc-700 text-center text-xs text-zinc-400">
                No exercises added yet. Tap "+ Add Exercise" to choose from the library.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedExercises.map((item, idx) => {
                  const ex = exerciseLibrary.find((e) => e.id === item.exerciseId);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col gap-2 ${
                        isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">
                          {idx + 1}. {ex?.name || 'Exercise'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-zinc-400">Sets</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={item.sets}
                            onChange={(e) => handleUpdateItem(idx, 'sets', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400">Reps</span>
                          <input
                            type="text"
                            value={item.reps}
                            onChange={(e) => handleUpdateItem(idx, 'reps', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400">Rest (s)</span>
                          <input
                            type="number"
                            step="15"
                            min="0"
                            value={item.restSec}
                            onChange={(e) => handleUpdateItem(idx, 'restSec', parseInt(e.target.value) || 30)}
                            className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={selectedExercises.length === 0 || !name.trim()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Save Routine to Library
            </button>
          </div>
        </form>

        {/* Exercise Selector Modal Sub-layer */}
        {showAddPicker && (
          <div className="absolute inset-0 z-20 bg-zinc-950/95 p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h4 className="font-bold text-sm">Select Exercise</h4>
              <button
                onClick={() => setShowAddPicker(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {exerciseLibrary.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleAddExercise(ex)}
                  className="w-full text-left p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between group transition-all"
                >
                  <div>
                    <p className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400">
                      {ex.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {ex.muscleGroup} • {ex.equipment} • {ex.difficulty}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
