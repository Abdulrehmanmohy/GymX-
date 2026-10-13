import React, { useState } from 'react';
import { ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';

interface AnalyticsPerformanceModuleProps {
  theme: ThemeMode;
  onOpenLiveWorkout?: () => void;
}

export const AnalyticsPerformanceModule: React.FC<AnalyticsPerformanceModuleProps> = ({
  theme,
  onOpenLiveWorkout,
}) => {
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | 'year'>('week');
  const [anatomyView, setAnatomyView] = useState<'front' | 'back'>('front');

  // Interactive volume day selection
  const [selectedDay, setSelectedDay] = useState<{
    day: string;
    volume: string;
    sessionName: string;
    leftPercent: string;
  }>({
    day: 'Tue',
    volume: '9,850 kg (Peak)',
    sessionName: 'Leg Hypertrophy 92% RPE',
    leftPercent: '26%',
  });

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const daysData = [
    { label: 'M', day: 'Mon', volume: '6,200 kg', sessionName: 'Push Power & Delts', height: '58%', isPeak: false },
    { label: 'T', day: 'Tue', volume: '9,850 kg (Peak)', sessionName: 'Leg Hypertrophy 92% RPE', height: '94%', isPeak: true },
    { label: 'W', day: 'Wed', volume: '2,100 kg', sessionName: 'Core & Mobility', height: '22%', isPeak: false },
    { label: 'T', day: 'Thu', volume: '7,400 kg', sessionName: 'Pull Hypertrophy', height: '72%', isPeak: false },
    { label: 'F', day: 'Fri', volume: '8,150 kg', sessionName: 'Chest & Delts', height: '82%', isPeak: false },
    { label: 'S', day: 'Sat', volume: '8,800 kg', sessionName: 'Posterior Chain', height: '86%', isPeak: false },
    { label: 'S', day: 'Sun', volume: '0 kg', sessionName: 'Full Regeneration', height: '8%', isPeak: false },
  ];

  const handleExport = () => {
    sounds.playCheckInSuccess();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2400);
  };

  return (
    <div id="analytics-performance-module" className="space-y-5 pb-20 animate-fadeIn">
      {/* Top Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-label-caps text-[10px] text-emerald-400 tracking-widest uppercase">
            BIOMETRIC TELEMETRY
          </span>
          <h1 className="text-xl font-black font-display tracking-tight text-white">
            Performance & Analytics HUD
          </h1>
        </div>
        <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-label-caps text-[10px] text-white">LIVE SYNC</span>
        </div>
      </div>

      {/* Time Range Selector Pill Tabs */}
      <section>
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center justify-between">
          {(['week', 'month', '3months', 'year'] as const).map((range) => {
            const labels: Record<string, string> = {
              week: 'Week',
              month: 'Month',
              '3months': '3 Months',
              year: 'Year',
            };
            const isActive = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => {
                  sounds.playClick();
                  setTimeRange(range);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-label-caps text-xs text-center transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/50 font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {labels[range]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Recovery & Readiness Gauge HUD */}
      <section className="relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">ecg_heart</span>
            <h2 className="font-label-caps text-[11px] tracking-widest text-zinc-300 uppercase">
              Biometric Recovery
            </h2>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-label-caps text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AUTONOMIC STATE</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Circular Recovery Meter (88%) */}
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background Ring Track */}
              <circle
                className="text-zinc-800"
                cx="70"
                cy="70"
                fill="transparent"
                r="58"
                stroke="currentColor"
                strokeWidth="9"
              />
              {/* Secondary Buffer Gauge */}
              <circle
                className="text-red-950"
                cx="70"
                cy="70"
                fill="transparent"
                r="58"
                stroke="currentColor"
                strokeDasharray="364.4"
                strokeDashoffset="65"
                strokeLinecap="round"
                strokeWidth="9"
              />
              {/* Primary Red Recovery Arc (88%) */}
              <circle
                className="text-red-600 ring-glow"
                cx="70"
                cy="70"
                fill="transparent"
                r="58"
                stroke="currentColor"
                strokeDasharray="364.4"
                strokeDashoffset="43.7"
                strokeLinecap="round"
                strokeWidth="9"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-metric text-4xl text-white font-bold tracking-tight">
                88<span className="text-lg text-emerald-400">%</span>
              </span>
              <span className="font-label-caps text-[11px] text-zinc-300 font-semibold tracking-wider uppercase">
                Optimal
              </span>
            </div>
          </div>

          {/* Telemetry Breakdown & Prescription */}
          <div className="flex-1 w-full space-y-3">
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="bg-black p-2.5 rounded-xl border border-zinc-800">
                <span className="font-label-caps text-[10px] text-zinc-400 block uppercase">
                  HRV Baseline
                </span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="font-metric text-xl font-bold text-white">94</span>
                  <span className="text-[11px] font-label-caps text-emerald-400">ms (+12)</span>
                </div>
              </div>
              <div className="bg-black p-2.5 rounded-xl border border-zinc-800">
                <span className="font-label-caps text-[10px] text-zinc-400 block uppercase">
                  Resting HR
                </span>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="font-metric text-xl font-bold text-white">48</span>
                  <span className="text-[11px] font-label-caps text-emerald-400">bpm</span>
                </div>
              </div>
            </div>

            {/* Recommendation Pill */}
            <div className="bg-zinc-950 border border-emerald-500/40 rounded-xl p-3 flex items-center space-x-2.5 shadow-lg shadow-black">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">fitness_center</span>
              </div>
              <p className="font-display font-bold text-white text-[13px] leading-tight">
                Prime for Heavy Compound Lifting Today
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Training Volume Interactive Chart */}
      <section className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">bar_chart</span>
              <h2 className="font-label-caps text-[11px] tracking-widest text-zinc-300 uppercase">
                Weekly Volume Load
              </h2>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="font-metric text-3xl text-white font-black">42,500</span>
              <span className="font-label-caps text-xs text-emerald-400 uppercase tracking-wider">
                KG Lifted
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center text-[11px] font-label-caps bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
              +14.2% VS LW
            </span>
          </div>
        </div>

        {/* Interactive Dynamic Bar Graph Container */}
        <div className="relative pt-7 pb-2">
          {/* Tooltip Floating Badge */}
          <div
            className="absolute top-0 -translate-x-1/2 bg-black border border-emerald-500 px-3 py-1 rounded-lg text-center shadow-lg shadow-emerald-950/60 transition-all duration-200 z-10"
            style={{ left: selectedDay.leftPercent }}
          >
            <div className="font-label-caps text-[10px] text-emerald-400 font-bold">
              {selectedDay.day.toUpperCase()} PEAK: {selectedDay.volume}
            </div>
            <div className="text-[9px] text-zinc-300 font-mono">{selectedDay.sessionName}</div>
          </div>

          <div className="flex items-end justify-between h-44 w-full gap-2 px-1 pt-4 border-b border-zinc-800">
            {daysData.map((d, idx) => {
              const isSelected = selectedDay.day === d.day;
              const leftPercents = ['12%', '26%', '40%', '55%', '69%', '83%', '95%'];

              return (
                <div
                  key={idx}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedDay({
                      day: d.day,
                      volume: d.volume,
                      sessionName: d.sessionName,
                      leftPercent: leftPercents[idx],
                    });
                  }}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  <div
                    className={`w-full rounded-t-sm transition-all duration-200 origin-bottom ${
                      d.isPeak
                        ? 'bg-emerald-500 shadow-[0_0_16px_rgba(16, 185, 129,0.6)]'
                        : isSelected
                        ? 'bg-emerald-500'
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                    style={{ height: d.height }}
                  />
                  <span
                    className={`font-label-caps text-[11px] mt-2 transition-colors ${
                      d.isPeak || isSelected ? 'text-emerald-400 font-black' : 'text-zinc-400'
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub Metrics Row */}
        <div className="flex items-center justify-between text-zinc-400 pt-1 text-[12px] font-mono">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5"></span>
            Maximum Threshold
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block mr-1.5"></span>
            Target Zone
          </span>
          <span className="text-zinc-400 font-label-caps">7-DAY RECAP</span>
        </div>
      </section>

      {/* Total Volume & Consistency Summary Card */}
      <section className="rounded-2xl bg-black border border-zinc-800 p-4 shadow-xl">
        <div className="grid grid-cols-3 divide-x divide-zinc-800">
          <div className="px-2 text-center">
            <span className="font-label-caps text-[10px] text-zinc-400 uppercase tracking-wider block">
              Completed
            </span>
            <div className="font-metric text-lg text-white font-black mt-1">
              4 <span className="text-xs text-zinc-400 font-normal">bouts</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">100% Target</span>
          </div>
          <div className="px-2 text-center">
            <span className="font-label-caps text-[10px] text-zinc-400 uppercase tracking-wider block">
              Avg Heart Rate
            </span>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-400 animate-pulse">
                favorite
              </span>
              <span className="font-metric text-lg text-white font-black">142</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Zone 3 Peak</span>
          </div>
          <div className="px-2 text-center">
            <span className="font-label-caps text-[10px] text-zinc-400 uppercase tracking-wider block">
              Density Rate
            </span>
            <div className="font-metric text-lg text-white font-black mt-1">94.8%</div>
            <span className="text-[10px] text-emerald-400 font-mono">Paced Work</span>
          </div>
        </div>
      </section>

      {/* Personal Records (PR) Spotlight Carousel */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">emoji_events</span>
            <h2 className="font-label-caps text-[11px] tracking-widest text-zinc-300 uppercase">
              Personal Records Spotlight
            </h2>
          </div>
          <span className="font-label-caps text-[10px] text-emerald-400 tracking-wider">
            LIFETIME ALL-TIME
          </span>
        </div>

        {/* Horizontal Scrollable PR Carousel */}
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {/* PR 1: Bench Press */}
          <div className="min-w-[240px] snap-center rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-emerald-500/60 p-4 relative shadow-lg shadow-emerald-950/40 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider">
                UPPER BODY POWER
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-label-caps text-[10px] font-bold shadow-md shadow-emerald-950/50">
                <span>🏆 +5 KG PR!</span>
              </span>
            </div>
            <div className="my-3">
              <h3 className="font-display text-base font-bold text-white">Bench Press</h3>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="font-metric text-3xl text-emerald-400 font-black">120</span>
                <span className="font-label-caps text-xs text-zinc-400 uppercase">kg</span>
                <span className="text-[11px] text-zinc-400 font-mono ml-1">(264.5 lbs)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Hit this week</span>
              <span className="text-emerald-400 font-semibold">1RM Verified</span>
            </div>
          </div>

          {/* PR 2: Barbell Squat */}
          <div className="min-w-[240px] snap-center rounded-2xl bg-zinc-900 border border-zinc-800 p-4 relative flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider">
                LOWER DOMINANCE
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-label-caps text-[10px]">
                <span>RECENT</span>
              </span>
            </div>
            <div className="my-3">
              <h3 className="font-display text-base font-bold text-white">Barbell Squat</h3>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="font-metric text-3xl text-white font-black">160</span>
                <span className="font-label-caps text-xs text-zinc-400 uppercase">kg</span>
                <span className="text-[11px] text-zinc-400 font-mono ml-1">(352.7 lbs)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Hit 3 days ago</span>
              <span className="text-emerald-400 font-semibold">RPE 9.5</span>
            </div>
          </div>

          {/* PR 3: Deadlift */}
          <div className="min-w-[240px] snap-center rounded-2xl bg-zinc-900 border border-zinc-800 p-4 relative flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-[10px] text-zinc-400 tracking-wider">
                POSTERIOR FORCE
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-label-caps text-[10px]">
                <span>MILESTONE</span>
              </span>
            </div>
            <div className="my-3">
              <h3 className="font-display text-base font-bold text-white">Deadlift</h3>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="font-metric text-3xl text-white font-black">200</span>
                <span className="font-label-caps text-xs text-zinc-400 uppercase">kg</span>
                <span className="text-[11px] text-zinc-400 font-mono ml-1">(440.9 lbs)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Unlocked 2 wks ago</span>
              <span className="text-emerald-400 font-semibold">Club 200</span>
            </div>
          </div>
        </div>
      </section>

      {/* Muscle Fatigue Matrix Overview */}
      <section className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">fitness_center</span>
            <h2 className="font-label-caps text-[11px] tracking-widest text-zinc-300 uppercase">
              Muscle Fatigue Matrix
            </h2>
          </div>
          {/* Front & Back Segmented View Toggle */}
          <div className="flex bg-black p-0.5 rounded-lg border border-zinc-800 text-[10px] font-label-caps">
            <button
              onClick={() => {
                sounds.playClick();
                setAnatomyView('front');
              }}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
                anatomyView === 'front'
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setAnatomyView('back');
              }}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
                anatomyView === 'back'
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Back
            </button>
          </div>
        </div>

        {/* Muscle Fatigue Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {anatomyView === 'front' ? (
            <>
              {/* Chest: 85% Rested */}
              <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display font-bold text-white text-[15px]">Chest</span>
                  <span className="font-label-caps text-[11px] text-emerald-400">85% Rested</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                  Ready for maximum load
                </span>
              </div>

              {/* Quads: 40% Strain */}
              <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display font-bold text-white text-[15px]">Quads</span>
                  <span className="font-label-caps text-[11px] text-amber-400 font-semibold">
                    40% Strain
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                  Recovery in progress (24h)
                </span>
              </div>

              {/* Deltoids: 90% Fresh */}
              <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display font-bold text-white text-[15px]">Deltoids</span>
                  <span className="font-label-caps text-[11px] text-emerald-400">90% Fresh</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                  Full capacity unlocked
                </span>
              </div>

              {/* Biceps: 75% Rested */}
              <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display font-bold text-white text-[15px]">Arms & Biceps</span>
                  <span className="font-label-caps text-[11px] text-zinc-300">75% Rested</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-zinc-400 h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                  Moderate volume ready
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Back & Lats */}
              <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display font-bold text-white text-[15px]">Back & Lats</span>
                  <span className="font-label-caps text-[11px] text-emerald-400">65% Active</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                  Moderate recovery level
                </span>
              </div>

              {/* Hamstrings */}
              <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display font-bold text-white text-[15px]">Hamstrings</span>
                  <span className="font-label-caps text-[11px] text-amber-400">55% Recovered</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '55%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                  Hinge loading ok
                </span>
              </div>

              {/* Traps */}
              <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display font-bold text-white text-[15px]">Upper Traps</span>
                  <span className="font-label-caps text-[11px] text-emerald-400">92% Rested</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                  Full overhead mobility
                </span>
              </div>

              {/* Lower Back / Erectors */}
              <div className="p-3 rounded-xl bg-black border border-zinc-800 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-display font-bold text-white text-[15px]">Spinal Erectors</span>
                  <span className="font-label-caps text-[11px] text-zinc-300">80% Rested</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-zinc-400 h-full rounded-full" style={{ width: '80%' }} />
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                  Stable axial brace
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Wearable Connectivity & Export Action Bar */}
      <section className="rounded-2xl bg-black border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">devices_wearables</span>
            <span className="font-label-caps text-[11px] text-zinc-300 uppercase tracking-wider">
              Connected Sensors
            </span>
          </div>
          <span className="font-label-caps text-[10px] text-emerald-400">3 ACTIVE STREAMS</span>
        </div>

        {/* Sensor Badges */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-label-caps text-[11px] text-white">WHOOP 4.0</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            <span className="font-label-caps text-[11px] text-white">Apple Health</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            <span className="font-label-caps text-[11px] text-white">Garmin HRM</span>
          </div>
        </div>

        {/* Export Report Kinetic Button */}
        <button
          onClick={handleExport}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all duration-150 text-white font-display font-extrabold tracking-wider uppercase text-[14px] flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">file_download</span>
          <span>{downloadSuccess ? 'Telemetry Report Exported (PDF / CSV) ✓' : 'Export Telemetry Report (PDF / CSV)'}</span>
        </button>
      </section>
    </div>
  );
};
