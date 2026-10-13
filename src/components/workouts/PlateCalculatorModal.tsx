import React, { useState, useMemo } from 'react';
import { X, Disc, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';

interface PlateCalculatorModalProps {
  initialWeightKg?: number;
  theme: ThemeMode;
  onApplyWeight?: (weightKg: number) => void;
  onClose: () => void;
}

interface PlateConfig {
  weight: number;
  color: string;
  textColor: string;
  borderColor: string;
  heightClass: string;
}

const AVAILABLE_PLATES: PlateConfig[] = [
  { weight: 25, color: 'bg-emerald-500', textColor: 'text-white', borderColor: 'border-emerald-400', heightClass: 'h-24' },
  { weight: 20, color: 'bg-blue-600', textColor: 'text-white', borderColor: 'border-blue-400', heightClass: 'h-22' },
  { weight: 15, color: 'bg-amber-500', textColor: 'text-black', borderColor: 'border-amber-300', heightClass: 'h-20' },
  { weight: 10, color: 'bg-emerald-600', textColor: 'text-white', borderColor: 'border-emerald-400', heightClass: 'h-18' },
  { weight: 5, color: 'bg-zinc-200', textColor: 'text-black', borderColor: 'border-zinc-400', heightClass: 'h-14' },
  { weight: 2.5, color: 'bg-zinc-800', textColor: 'text-white', borderColor: 'border-zinc-600', heightClass: 'h-12' },
  { weight: 1.25, color: 'bg-zinc-400', textColor: 'text-black', borderColor: 'border-zinc-200', heightClass: 'h-10' },
];

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeightKg = 80,
  theme,
  onApplyWeight,
  onClose,
}) => {
  const isDark = theme === 'dark';
  const [targetWeight, setTargetWeight] = useState<number>(initialWeightKg || 80);
  const [barWeight, setBarWeight] = useState<number>(20); // 20kg standard Olympic bar

  const barOptions = [
    { label: "Olympic Bar (20 kg)", weight: 20 },
    { label: "Women's / Tech Bar (15 kg)", weight: 15 },
    { label: "EZ-Curl Bar (10 kg)", weight: 10 },
    { label: "Smith Machine Bar (15 kg)", weight: 15 },
    { label: "Dumbbell Per Hand (0 kg)", weight: 0 },
  ];

  // Calculate plates per side
  const calculation = useMemo(() => {
    if (targetWeight <= barWeight) {
      return {
        platesPerSide: [] as { plate: PlateConfig; count: number }[],
        weightPerSide: 0,
        unmatchedWeight: 0,
      };
    }

    const netWeightToLoad = targetWeight - barWeight;
    let weightPerSide = netWeightToLoad / 2;
    let remainingPerSide = weightPerSide;

    const platesPerSide: { plate: PlateConfig; count: number }[] = [];

    for (const plate of AVAILABLE_PLATES) {
      if (remainingPerSide >= plate.weight) {
        const count = Math.floor(remainingPerSide / plate.weight);
        platesPerSide.push({ plate, count });
        remainingPerSide = Math.round((remainingPerSide - count * plate.weight) * 100) / 100;
      }
    }

    return {
      platesPerSide,
      weightPerSide,
      unmatchedWeight: Math.round(remainingPerSide * 2 * 100) / 100,
    };
  }, [targetWeight, barWeight]);

  const handleStepWeight = (delta: number) => {
    sounds.playClick();
    setTargetWeight((prev) => Math.max(barWeight, Math.round((prev + delta) * 10) / 10));
  };

  return (
    <div
      id="plate-calculator-modal"
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
              <Disc className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">
                GYM PROBLEM SOLVER
              </span>
              <h2 className="text-base font-black font-display text-white">Barbell Plate Calculator</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Target Weight Controls */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 font-mono">
              TARGET TOTAL WEIGHT
            </span>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleStepWeight(-5)}
                className="w-11 h-11 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-black text-base border border-zinc-700 active:scale-95 transition-all cursor-pointer"
              >
                -5
              </button>
              <button
                onClick={() => handleStepWeight(-2.5)}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm border border-zinc-700 active:scale-95 transition-all cursor-pointer"
              >
                -2.5
              </button>

              <div className="px-4 py-2 rounded-2xl bg-black border-2 border-emerald-500/80 shadow-lg shadow-emerald-950/40">
                <span className="text-3xl font-black font-mono text-white tracking-tight">
                  {targetWeight}
                  <span className="text-sm font-bold text-emerald-400 ml-1">kg</span>
                </span>
              </div>

              <button
                onClick={() => handleStepWeight(2.5)}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm border border-zinc-700 active:scale-95 transition-all cursor-pointer"
              >
                +2.5
              </button>
              <button
                onClick={() => handleStepWeight(5)}
                className="w-11 h-11 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-black text-base border border-zinc-700 active:scale-95 transition-all cursor-pointer"
              >
                +5
              </button>
            </div>

            {/* Quick 1-Tap Weight Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {[40, 60, 70, 80, 90, 100, 110, 120, 140].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    sounds.playClick();
                    setTargetWeight(w);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    targetWeight === w
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md font-black'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>

          {/* Bar Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              Barbell Type ({barWeight} kg bar)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {barOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    sounds.playClick();
                    setBarWeight(opt.weight);
                    if (targetWeight < opt.weight) setTargetWeight(opt.weight);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer text-xs ${
                    barWeight === opt.weight
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/50'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <p className="font-bold truncate">{opt.label.split('(')[0]}</p>
                  <p className="text-[11px] font-mono text-emerald-400 mt-0.5">{opt.weight} kg</p>
                </button>
              ))}
            </div>
          </div>

          {/* VISUAL BARBELL LOADING DIAGRAM */}
          <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-emerald-400" />
                Visual Bar Loading (Per Side)
              </span>
              <span className="font-mono font-black text-emerald-400">
                {calculation.weightPerSide} kg per side
              </span>
            </div>

            {/* Graphic Barbell Rendering */}
            <div className="relative h-28 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-center px-4 overflow-x-auto">
              {/* Center Bar Shaft */}
              <div className="absolute left-0 right-0 h-4 bg-zinc-700 border-y border-zinc-600 z-0">
                <div className="h-full w-full bg-gradient-to-r from-zinc-800 via-zinc-500 to-zinc-800 opacity-60" />
              </div>

              {/* Collar Stopper */}
              <div className="relative z-10 w-4 h-16 bg-zinc-400 rounded border border-zinc-300 shadow-md mr-1.5 flex items-center justify-center">
                <div className="w-1 h-8 bg-zinc-600 rounded-full" />
              </div>

              {/* Plates stacked on sleeve */}
              <div className="relative z-10 flex items-center gap-1">
                {calculation.platesPerSide.length === 0 ? (
                  <span className="text-xs text-zinc-500 font-mono font-bold italic ml-3">
                    Empty Barbell Sleeve (0 kg added)
                  </span>
                ) : (
                  calculation.platesPerSide.flatMap(({ plate, count }, pIdx) =>
                    Array.from({ length: count }).map((_, cIdx) => (
                      <div
                        key={`${pIdx}-${cIdx}`}
                        className={`w-6 sm:w-7 rounded-sm border-2 shadow-lg flex flex-col items-center justify-center transition-all ${plate.color} ${plate.borderColor} ${plate.heightClass}`}
                        title={`${plate.weight} kg Plate`}
                      >
                        <span className={`text-[9px] font-black font-mono leading-none ${plate.textColor}`}>
                          {plate.weight}
                        </span>
                      </div>
                    ))
                  )
                )}

                {/* Outer Collar Lock */}
                {calculation.platesPerSide.length > 0 && (
                  <div className="w-3 h-10 bg-amber-500 rounded-sm border border-amber-300 shadow flex items-center justify-center ml-1">
                    <div className="w-1 h-4 bg-black/60 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* List breakdown per side */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                Load On Each Side:
              </span>
              {calculation.platesPerSide.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {calculation.platesPerSide.map(({ plate, count }) => (
                    <div
                      key={plate.weight}
                      className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${plate.color} border ${plate.borderColor}`} />
                        <span className="font-mono text-xs font-bold text-white">{plate.weight} kg</span>
                      </div>
                      <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        × {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-mono">Just lift the empty bar!</p>
              )}
            </div>

            {calculation.unmatchedWeight > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
                <span>⚠️ Note: {calculation.unmatchedWeight} kg cannot be balanced with available plates. Nearest load is {targetWeight - calculation.unmatchedWeight} kg.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3 bg-zinc-950">
          <button
            onClick={() => {
              sounds.playClick();
              setTargetWeight(initialWeightKg || 80);
            }}
            className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onApplyWeight ? (
            <button
              onClick={() => {
                sounds.playClick();
                onApplyWeight(targetWeight);
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer font-display"
            >
              <span>Apply {targetWeight} kg to Active Set</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer font-display"
            >
              <span>Done</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
