import React, { useState, useMemo } from 'react';
import { ScheduledTask, SmartNotification, ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  BellRing,
  Trash2,
  Clock,
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  RotateCcw,
  Check,
} from 'lucide-react';
import { PushNotificationPayload } from '../common/NotificationBanner';

interface DailyPlannerModuleProps {
  tasks: ScheduledTask[];
  notifications: SmartNotification[];
  theme: ThemeMode;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<ScheduledTask, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleNotification: (notifId: string) => void;
  onTriggerTestPush: (payload: PushNotificationPayload) => void;
}

// Utility to format date as YYYY-MM-DD
const toIsoDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const DailyPlannerModule: React.FC<DailyPlannerModuleProps> = ({
  tasks,
  notifications,
  theme,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onToggleNotification,
  onTriggerTestPush,
}) => {
  const isDark = theme === 'dark';
  const todayIso = useMemo(() => toIsoDateString(new Date()), []);

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  // View mode: 'week' or 'month'
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  // Week navigation offset (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  // Month navigation base date (tracks month/year)
  const [displayMonthDate, setDisplayMonthDate] = useState<Date>(() => new Date());
  // Filter for tasks
  const [filterType, setFilterType] = useState<string>('all');

  // Modal state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string>(todayIso);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<ScheduledTask['type']>('workout');
  const [newTaskTime, setNewTaskTime] = useState('05:30 PM');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Generate 7 days of the active week based on weekOffset
  const currentWeekDays = useMemo(() => {
    const base = new Date();
    // Monday as start of week
    const day = base.getDay();
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMon + weekOffset * 7);

    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = toIsoDateString(d);
      result.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: String(d.getDate()).padStart(2, '0'),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: iso,
        isToday: iso === todayIso,
      });
    }
    return result;
  }, [weekOffset, todayIso]);

  // Generate days for Month Grid
  const currentMonthGrid = useMemo(() => {
    const year = displayMonthDate.getFullYear();
    const month = displayMonthDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week for 1st day (0 = Sun, 1 = Mon ... 6 = Sat)
    // Convert so Mon = 0 ... Sun = 6
    let startingIndex = firstDayOfMonth.getDay() - 1;
    if (startingIndex === -1) startingIndex = 6;

    const totalDays = lastDayOfMonth.getDate();
    const days = [];

    // Previous month padding
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startingIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDate - i);
      days.push({
        dayNum: prevDate.getDate(),
        fullDate: toIsoDateString(prevDate),
        isCurrentMonth: false,
        isToday: toIsoDateString(prevDate) === todayIso,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(year, month, d);
      const iso = toIsoDateString(currDate);
      days.push({
        dayNum: d,
        fullDate: iso,
        isCurrentMonth: true,
        isToday: iso === todayIso,
      });
    }

    // Next month padding to fill grid to multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nextDate = new Date(year, month + 1, n);
      days.push({
        dayNum: n,
        fullDate: toIsoDateString(nextDate),
        isCurrentMonth: false,
        isToday: toIsoDateString(nextDate) === todayIso,
      });
    }

    return days;
  }, [displayMonthDate, todayIso]);

  // Tasks for the selected date
  const selectedDayTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchDate = t.date === selectedDate;
      const matchFilter = filterType === 'all' || t.type === filterType;
      return matchDate && matchFilter;
    });
  }, [tasks, selectedDate, filterType]);

  // Completion metrics
  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPercentage =
    totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Header display string
  const currentWeekLabel = useMemo(() => {
    if (calendarView === 'week') {
      const first = currentWeekDays[0];
      const last = currentWeekDays[6];
      return `${first.monthName} ${first.dayNum} – ${last.monthName} ${last.dayNum}, ${new Date(
        first.fullDate
      ).getFullYear()}`;
    } else {
      return displayMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }, [calendarView, currentWeekDays, displayMonthDate]);

  // Jump to Today
  const handleJumpToToday = () => {
    sounds.playClick();
    setSelectedDate(todayIso);
    setWeekOffset(0);
    setDisplayMonthDate(new Date());
  };

  // Quick navigation
  const handlePrev = () => {
    sounds.playClick();
    if (calendarView === 'week') {
      setWeekOffset((prev) => prev - 1);
    } else {
      setDisplayMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (calendarView === 'week') {
      setWeekOffset((prev) => prev + 1);
    } else {
      setDisplayMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  // Open modal with pre-filled date
  const handleOpenAddModal = (dateStr?: string) => {
    sounds.playClick();
    setNewTaskDate(dateStr || selectedDate);
    setNewTaskTitle('');
    setNewTaskNotes('');
    setShowAddTaskModal(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    sounds.playClick();

    onAddTask({
      date: newTaskDate || selectedDate,
      title: newTaskTitle.trim(),
      type: newTaskType,
      time: newTaskTime,
      completed: false,
      notes: newTaskNotes.trim() || undefined,
    });

    setNewTaskTitle('');
    setNewTaskNotes('');
    setShowAddTaskModal(false);
  };

  // Quick 1-tap presets
  const handleAddQuickPreset = (presetTitle: string, presetType: ScheduledTask['type']) => {
    sounds.playClick();
    onAddTask({
      date: selectedDate,
      title: presetTitle,
      type: presetType,
      time: presetType === 'rest' ? 'All Day' : '05:30 PM',
      completed: false,
      notes: `Quick scheduled ${presetTitle.toLowerCase()} routine.`,
    });
  };

  const getTypeBadge = (type: ScheduledTask['type']) => {
    switch (type) {
      case 'workout':
        return { label: 'Workout', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'rest':
        return { label: 'Rest Day', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
      case 'nutrition':
        return { label: 'Nutrition', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'stretch':
        return { label: 'Mobility', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
      case 'cardio':
        return { label: 'Cardio', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
      default:
        return { label: 'Session', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  // Formatted date string for selected date heading
  const selectedDateFormatted = useMemo(() => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div id="daily-planner-module" className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Header & Add Session Action */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
              FITNESS TIMETABLE // DYNAMIC ENGINE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight font-display text-white mt-0.5">
            Calendar <span className="text-emerald-400">Planner</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Jump to Today button */}
          <button
            onClick={handleJumpToToday}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              selectedDate === todayIso
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
            }`}
            title="Jump to today's schedule"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>Today</span>
          </button>

          {/* Add Session Button */}
          <button
            id="add-schedule-task-btn"
            onClick={() => handleOpenAddModal()}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Fitness Objectives & Completion Progress Bar */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-md'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white">Fitness Goal Adherence</h3>
              <p className="text-[10px] text-zinc-400">Target: 5 workouts + 2 recovery periods per week</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-xs text-emerald-400">
              {completedCount} / {totalTasksCount} Done ({completionPercentage}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-zinc-950 border border-zinc-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-300 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, completionPercentage)}%` }}
          />
        </div>
      </div>

      {/* Interactive Calendar Hub */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}
      >
        {/* Navigation & View Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black tracking-tight text-white block">
                {currentWeekLabel}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {calendarView === 'week'
                  ? weekOffset === 0
                    ? 'Current Week'
                    : weekOffset > 0
                    ? `+${weekOffset} Weeks Ahead`
                    : `${Math.abs(weekOffset)} Weeks Ago`
                  : 'Full Month Calendar'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Switcher (Week / Month) */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px] font-bold">
              <button
                onClick={() => {
                  sounds.playClick();
                  setCalendarView('week');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  calendarView === 'week'
                    ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setCalendarView('month');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  calendarView === 'month'
                    ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Month
              </button>
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                title={calendarView === 'week' ? 'Previous week' : 'Previous month'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                title={calendarView === 'week' ? 'Next week' : 'Next month'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: 7-Day Week Strip */}
        {calendarView === 'week' && (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
            {currentWeekDays.map((day) => {
              const isSelected = selectedDate === day.fullDate;
              const dayTasksAll = tasks.filter((t) => t.date === day.fullDate);
              const hasTask = dayTasksAll.length > 0;
              const hasRest = dayTasksAll.some((t) => t.type === 'rest');
              const hasWorkout = dayTasksAll.some((t) => t.type === 'workout');
              const allDone = hasTask && dayTasksAll.every((t) => t.completed);

              return (
                <button
                  key={day.fullDate}
                  id={`calendar-day-${day.fullDate}`}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedDate(day.fullDate);
                  }}
                  className={`py-2 px-1 sm:px-2 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/25 scale-[1.02]'
                      : day.isToday
                      ? 'bg-zinc-800/90 border-emerald-500/60 text-white ring-1 ring-emerald-500/40'
                      : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
                  }`}
                >
                  {/* Today top marker */}
                  {day.isToday && !isSelected && (
                    <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}

                  <span
                    className={`text-[10px] font-semibold ${
                      isSelected ? 'text-black' : day.isToday ? 'text-emerald-400' : 'text-zinc-400'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span
                    className={`text-sm sm:text-base font-black mt-0.5 font-display ${
                      isSelected ? 'text-black' : 'text-white'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {/* Indicator dots */}
                  <div className="flex items-center gap-1 mt-1.5 h-2">
                    {hasTask ? (
                      <>
                        {hasWorkout && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-black' : 'bg-emerald-400'
                            }`}
                          />
                        )}
                        {hasRest && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-blue-900' : 'bg-blue-400'
                            }`}
                          />
                        )}
                        {allDone && (
                          <Check className={`w-2 h-2 ${isSelected ? 'text-black' : 'text-emerald-400'}`} />
                        )}
                      </>
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-transparent" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* VIEW 2: Full Month Grid View */}
        {calendarView === 'month' && (
          <div className="space-y-1.5 pt-1">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold text-zinc-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {currentMonthGrid.map((day, idx) => {
                const isSelected = selectedDate === day.fullDate;
                const cellTasks = tasks.filter((t) => t.date === day.fullDate);
                const hasTask = cellTasks.length > 0;
                const hasWorkout = cellTasks.some((t) => t.type === 'workout');
                const hasRest = cellTasks.some((t) => t.type === 'rest');

                return (
                  <button
                    key={`${day.fullDate}-${idx}`}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedDate(day.fullDate);
                    }}
                    className={`p-1.5 min-h-[46px] rounded-xl flex flex-col items-center justify-between border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md shadow-emerald-500/20'
                        : day.isToday
                        ? 'bg-zinc-800 border-emerald-500/60 text-white ring-1 ring-emerald-500/40'
                        : day.isCurrentMonth
                        ? 'bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                        : 'bg-zinc-950/30 border-zinc-900 text-zinc-600'
                    }`}
                  >
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected
                          ? 'text-black'
                          : day.isToday
                          ? 'text-emerald-400'
                          : day.isCurrentMonth
                          ? 'text-zinc-200'
                          : 'text-zinc-600'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    {/* Task count & dot */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {hasTask && (
                        <>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected
                                ? 'bg-black'
                                : hasWorkout
                                ? 'bg-emerald-400'
                                : hasRest
                                ? 'bg-blue-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          <span
                            className={`text-[9px] font-mono font-bold leading-none ${
                              isSelected ? 'text-black' : 'text-zinc-400'
                            }`}
                          >
                            {cellTasks.length}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE ITEMS FOR SELECTED DAY */}
      <div className="space-y-3">
        {/* Selected date title and quick controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">{selectedDateFormatted}</h3>
              {selectedDate === todayIso && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-emerald-500 text-black">
                  TODAY
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'Session' : 'Sessions'} scheduled
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'workout', label: 'Workouts' },
              { id: 'rest', label: 'Rest' },
              { id: 'stretch', label: 'Mobility' },
              { id: 'nutrition', label: 'Nutrition' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sounds.playClick();
                  setFilterType(f.id);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        {selectedDayTasks.length === 0 ? (
          <div
            className={`p-6 sm:p-8 rounded-2xl border text-center space-y-3 ${
              isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 mx-auto flex items-center justify-center text-emerald-400">
              <CalendarIcon className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-bold text-white">No sessions scheduled for this date</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Use the 1-tap presets below or create a custom workout plan.
              </p>
            </div>

            {/* 1-Tap Quick Action Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-md mx-auto">
              <button
                onClick={() => handleAddQuickPreset('Push Hypertrophy Session', 'workout')}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black border border-zinc-700 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
              >
                + Push Workout
              </button>
              <button
                onClick={() => handleAddQuickPreset('Pull Power & Lats', 'workout')}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black border border-zinc-700 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
              >
                + Pull Workout
              </button>
              <button
                onClick={() => handleAddQuickPreset('Heavy Leg Day Blitz', 'workout')}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black border border-zinc-700 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
              >
                + Leg Day
              </button>
              <button
                onClick={() => handleAddQuickPreset('Full Rest & Muscle Repair', 'rest')}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-blue-500 hover:text-white border border-zinc-700 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
              >
                + Rest Day
              </button>
              <button
                onClick={() => handleAddQuickPreset('Post-Workout Protein Window', 'nutrition')}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-black border border-zinc-700 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
              >
                + Nutrition Target
              </button>
            </div>

            <div className="pt-1">
              <button
                onClick={() => handleOpenAddModal(selectedDate)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                + Custom Session Details
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayTasks.map((task) => {
              const badge = getTypeBadge(task.type);

              return (
                <div
                  key={task.id}
                  id={`task-item-${task.id}`}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                    task.completed
                      ? isDark
                        ? 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
                        : 'bg-zinc-100/70 border-zinc-200 opacity-75'
                      : isDark
                      ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/40 shadow-sm'
                      : 'bg-white border-zinc-200 shadow-sm'
                  }`}
                >
                  {/* Toggle button */}
                  <button
                    onClick={() => {
                      sounds.playSetSuccess();
                      onToggleTask(task.id);
                    }}
                    className={`mt-0.5 transition-transform active:scale-90 cursor-pointer ${
                      task.completed ? 'text-emerald-400' : 'text-zinc-500 hover:text-emerald-400'
                    }`}
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {task.time && (
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          {task.time}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold leading-tight ${
                        task.completed ? 'line-through text-zinc-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.notes && (
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{task.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onDeleteTask(task.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-zinc-800"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SMART PUSH NOTIFICATIONS / REMINDERS */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white">Smart Gym Push Notifications</h3>
              <p className="text-[10px] text-zinc-400">Automated pre-workout, hydration & macro alerts</p>
            </div>
          </div>

          {/* Test push notification trigger button */}
          <button
            id="test-push-notification-btn"
            onClick={() => {
              sounds.playCheckInSuccess();
              onTriggerTestPush({
                id: `push-${Date.now()}`,
                title: '⚡ GymX Hydration Alert',
                body: 'Electrolytes running low. Take 500ml water now to maintain maximal lifting power!',
                category: 'water',
              });
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Test Push</span>
          </button>
        </div>

        {/* List of Notification Automations */}
        <div className="space-y-2 pt-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-200">{notif.title}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    {notif.time}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate mt-0.5">{notif.body}</p>
              </div>

              {/* Toggle switch */}
              <button
                id={`toggle-notif-${notif.id}`}
                onClick={() => {
                  sounds.playClick();
                  onToggleNotification(notif.id);
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${
                  notif.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    notif.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 space-y-3.5 shadow-2xl ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm font-display text-white">
                Schedule Workout or Recovery
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              {/* Date Input */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Session Title */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Push Hypertrophy or Rest Day"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {/* Suggestions chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Push Day', 'Pull Strength', 'Leg Blitz', 'Rest Day', 'Mobility Flow'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setNewTaskTitle(preset);
                        if (preset.includes('Rest')) setNewTaskType('rest');
                        else if (preset.includes('Mobility')) setNewTaskType('stretch');
                        else setNewTaskType('workout');
                      }}
                      className="px-2 py-0.5 rounded-md bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-750"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Category</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="workout">Workout</option>
                    <option value="rest">Rest Day</option>
                    <option value="cardio">Cardio</option>
                    <option value="stretch">Mobility</option>
                    <option value="nutrition">Nutrition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="05:30 PM"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Notes / Target Weight</label>
                <textarea
                  rows={2}
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="e.g. Hit 85kg on flat bench, drink 3L water..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/25 cursor-pointer transition-all active:scale-95"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
