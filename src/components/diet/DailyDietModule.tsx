import React, { useState } from 'react';
import { MealEntry, ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';
import {
  Utensils,
  Plus,
  Flame,
  Droplets,
  Camera,
  Trash2,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface DailyDietModuleProps {
  meals: MealEntry[];
  waterIntakeMl: number;
  waterTargetMl: number;
  theme: ThemeMode;
  onAddMeal: (meal: Omit<MealEntry, 'id'>) => void;
  onDeleteMeal: (mealId: string) => void;
  onUpdateWater: (delta: number) => void;
  onResetWater: () => void;
  onNavigateToScanner: () => void;
}

export const DailyDietModule: React.FC<DailyDietModuleProps> = ({
  meals,
  waterIntakeMl,
  waterTargetMl,
  theme,
  onAddMeal,
  onDeleteMeal,
  onUpdateWater,
  onResetWater,
  onNavigateToScanner,
}) => {
  const isDark = theme === 'dark';
  const [showAddModal, setShowAddModal] = useState(false);

  // Daily Nutritional Targets
  const TARGET_CALORIES = 2400;
  const TARGET_PROTEIN = 180; // g
  const TARGET_CARBS = 220; // g
  const TARGET_FAT = 65; // g

  // Compute totals
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  // Form State for manual meal logging
  const [newMealType, setNewMealType] = useState<MealEntry['mealType']>('Breakfast');
  const [newMealName, setNewMealName] = useState('');
  const [newCalories, setNewCalories] = useState<number>(400);
  const [newProtein, setNewProtein] = useState<number>(30);
  const [newCarbs, setNewCarbs] = useState<number>(40);
  const [newFat, setNewFat] = useState<number>(10);

  const handleCreateMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;
    sounds.playSetSuccess();

    onAddMeal({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: newMealType,
      name: newMealName.trim(),
      calories: newCalories,
      protein: newProtein,
      carbs: newCarbs,
      fat: newFat,
      source: 'manual',
    });

    setNewMealName('');
    setShowAddModal(false);
  };

  // Macro Ring SVG Helper
  const renderMacroRing = (
    label: string,
    current: number,
    target: number,
    color: string,
    unit: string = 'g'
  ) => {
    const percent = Math.min(100, Math.round((current / target) * 100));
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            {/* Background track */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={isDark ? '#27272a' : '#e4e4e7'}
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated progress arc */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={color}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono font-extrabold text-xs leading-none">{current}</span>
            <span className="text-[9px] text-zinc-500 font-medium">{unit}</span>
          </div>
        </div>
        <span className="text-[11px] font-bold mt-1 text-zinc-300">{label}</span>
        <span className="text-[9px] text-zinc-500">
          of {target}
          {unit}
        </span>
      </div>
    );
  };

  // Water fill percentage
  const waterPercent = Math.min(100, Math.round((waterIntakeMl / waterTargetMl) * 100));

  const mealTypes: MealEntry['mealType'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <div id="daily-diet-module" className="space-y-4 pb-20">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight font-display">Daily Diet & Macros</h1>
          <p className="text-xs text-zinc-400">Nutrient progress rings, meal logs & hydration</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="scan-meal-shortcut-btn"
            onClick={onNavigateToScanner}
            className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-bold flex items-center gap-1 hover:bg-purple-500/30 transition-all"
            title="Scan with Smart Camera"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Smart Scan</span>
          </button>
          <button
            id="log-meal-manual-btn"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Log Meal</span>
          </button>
        </div>
      </div>

      {/* Hero Macro Progress Card with Rings */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Today's Caloric Balance
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black font-display">{totalCalories.toLocaleString()}</span>
              <span className="text-xs text-zinc-400 font-medium">/ {TARGET_CALORIES} kcal target</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400">
              {Math.max(0, TARGET_CALORIES - totalCalories)} kcal left
            </span>
            <p className="text-[10px] text-zinc-500">
              {Math.round((totalCalories / TARGET_CALORIES) * 100)}% consumed
            </p>
          </div>
        </div>

        {/* Progress Rings Grid */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80">
          {renderMacroRing('Calories', totalCalories, TARGET_CALORIES, '#10B981', '')}
          {renderMacroRing('Protein', totalProtein, TARGET_PROTEIN, '#38bdf8', 'g')}
          {renderMacroRing('Carbs', totalCarbs, TARGET_CARBS, '#fbbf24', 'g')}
          {renderMacroRing('Fats', totalFat, TARGET_FAT, '#f43f5e', 'g')}
        </div>
      </div>

      {/* Water Intake Tracker Card */}
      <div
        className={`p-4 rounded-3xl border transition-all relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-blue-950/40 via-zinc-900 to-cyan-950/30 border-cyan-500/30'
            : 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Droplets className="w-5 h-5 fill-cyan-400/40" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm font-display">Water Intake Tracker</h3>
              <p className="text-[11px] text-zinc-400">
                {waterIntakeMl} ml of {waterTargetMl} ml goal ({waterPercent}%)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onResetWater();
            }}
            className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 underline"
          >
            Reset
          </button>
        </div>

        {/* Water Fluid Level Progress Bar */}
        <div className="w-full h-3 rounded-full bg-zinc-800/80 border border-cyan-500/20 overflow-hidden my-3">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/50"
            style={{ width: `${waterPercent}%` }}
          />
        </div>

        {/* Quick Add Water Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="water-add-250"
            onClick={() => {
              sounds.playClick();
              onUpdateWater(250);
            }}
            className="flex-1 py-2 px-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> +250ml Glass
          </button>
          <button
            id="water-add-500"
            onClick={() => {
              sounds.playClick();
              onUpdateWater(500);
            }}
            className="flex-1 py-2 px-2 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> +500ml Shaker
          </button>
        </div>
      </div>

      {/* Meals Grouped by Type */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Today's Meals</h3>
          <span className="text-[11px] text-zinc-500">{meals.length} Logged</span>
        </div>

        {mealTypes.map((type) => {
          const typeMeals = meals.filter((m) => m.mealType === type);
          const typeCalories = typeMeals.reduce((acc, m) => acc + m.calories, 0);

          return (
            <div
              key={type}
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-zinc-200 font-display">{type}</span>
                  <span className="text-[10px] text-zinc-500">
                    {typeMeals.length} {typeMeals.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">{typeCalories} kcal</span>
              </div>

              {typeMeals.length === 0 ? (
                <p className="text-[11px] text-zinc-500 italic py-1">No food logged for {type}.</p>
              ) : (
                <div className="space-y-2">
                  {typeMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 ${
                        isDark ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      {meal.imageUri && (
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-black">
                          <img
                            src={meal.imageUri}
                            alt={meal.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs truncate text-zinc-100">{meal.name}</h4>
                          {meal.source === 'ai_scanner' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Smart Scan
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          P: <span className="text-cyan-400 font-semibold">{meal.protein}g</span> • C:{' '}
                          <span className="text-amber-400 font-semibold">{meal.carbs}g</span> • F:{' '}
                          <span className="text-rose-400 font-semibold">{meal.fat}g</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-300">
                          {meal.calories} kcal
                        </span>
                        <button
                          onClick={() => onDeleteMeal(meal.id)}
                          className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                          title="Delete meal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Meal Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 space-y-3.5 shadow-2xl ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <h3 className="font-extrabold text-sm font-display text-white">Log Meal & Nutrition</h3>

            <form onSubmit={handleCreateMeal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Meal Category</label>
                <div className="grid grid-cols-4 gap-1">
                  {mealTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewMealType(t)}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                        newMealType === t
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Food / Dish Name</label>
                <input
                  type="text"
                  required
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder="e.g. Grilled Chicken & White Rice"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCalories}
                    onChange={(e) => setNewCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProtein}
                    onChange={(e) => setNewProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCarbs}
                    onChange={(e) => setNewCarbs(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFat}
                    onChange={(e) => setNewFat(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-850 border border-zinc-700 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-md shadow-emerald-500/30"
                >
                  Save Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
