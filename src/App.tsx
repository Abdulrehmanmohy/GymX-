import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  ThemeMode,
  UserRole,
  Exercise,
  WorkoutRoutine,
  ScheduledTask,
  SmartNotification,
  MealEntry,
  GymMember,
  AttendanceRecord,
} from './types/gym';
import {
  INITIAL_EXERCISES,
  INITIAL_ROUTINES,
  INITIAL_SCHEDULED_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MEALS,
  INITIAL_MEMBERS,
  INITIAL_ATTENDANCE_LOGS,
} from './data/gymData';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { NotificationBanner, PushNotificationPayload } from './components/common/NotificationBanner';
import { WorkoutsModule } from './components/workouts/WorkoutsModule';
import { DailyPlannerModule } from './components/planner/DailyPlannerModule';
import { TodayWorkoutHub } from './components/planner/TodayWorkoutHub';
import { AnalyticsPerformanceModule } from './components/analytics/AnalyticsPerformanceModule';
import { DailyDietModule } from './components/diet/DailyDietModule';
import { SmartFoodScannerModule } from './components/scanner/SmartFoodScannerModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { ActiveWorkoutSessionModal } from './components/workouts/ActiveWorkoutSessionModal';
import { PlateCalculatorModal } from './components/workouts/PlateCalculatorModal';
import { OneRepMaxModal } from './components/workouts/OneRepMaxModal';
import { WarmUpPyramidModal } from './components/workouts/WarmUpPyramidModal';
import { THEME_PALETTES, ThemePaletteId } from './utils/themePalettes';
import { ThemePaletteSelector } from './components/common/ThemePaletteSelector';
import { InstallAppModal } from './components/common/InstallAppModal';
import { sounds } from './utils/audio';
import { Smartphone, X, Camera, Utensils } from 'lucide-react';

export default function App() {
  // Navigation & Viewport State
  const [activeTab, setActiveTab] = useState<ActiveTab>('workouts');
  const [scannerSubMode, setScannerSubMode] = useState<'camera' | 'diet'>('camera');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [activeNotification, setActiveNotification] = useState<PushNotificationPayload | null>(null);

  // Athletic Theme Palette State & Sound State
  const [currentPalette, setCurrentPalette] = useState<ThemePaletteId>('cyber-green');
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getIsMuted());

  // KINETIC Sub-mode & Modal States
  const [plannerSubMode, setPlannerSubMode] = useState<'today' | 'calendar'>('today');
  const [activeLiveRoutine, setActiveLiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState<boolean>(false);
  const [is1RMCalcOpen, setIs1RMCalcOpen] = useState<boolean>(false);
  const [isWarmupOpen, setIsWarmupOpen] = useState<boolean>(false);

  // Standalone PWA install state
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [dismissInstallBanner, setDismissInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleToggleMuted = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    if (!next) sounds.playClick();
  };

  // Application Data States
  const [exerciseLibrary] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(INITIAL_ROUTINES);
  const [tasks, setTasks] = useState<ScheduledTask[]>(INITIAL_SCHEDULED_TASKS);
  const [notifications, setNotifications] = useState<SmartNotification[]>(INITIAL_NOTIFICATIONS);
  const [meals, setMeals] = useState<MealEntry[]>(INITIAL_MEALS);
  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(1750);
  const waterTargetMl = 3000;
  const [members, setMembers] = useState<GymMember[]>(INITIAL_MEMBERS);
  const currentMemberId = 'mem-1'; // Marcus Vance
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_LOGS);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];
  const isDark = theme === 'dark';

  // Synchronize with Express REST Backend on mount
  useEffect(() => {
    async function initBackendSync() {
      try {
        const statusRes = await fetch('/api/system/status');
        if (statusRes.ok) {
          setBackendOnline(true);
        }

        // Fetch server routines
        const routinesRes = await fetch('/api/routines');
        if (routinesRes.ok) {
          const json = await routinesRes.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setRoutines(json.data);
          }
        }

        // Fetch server tasks
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const json = await tasksRes.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setTasks(json.data);
          }
        }

        // Fetch server diet
        const dietRes = await fetch('/api/diet');
        if (dietRes.ok) {
          const json = await dietRes.json();
          if (json.data) {
            if (Array.isArray(json.data.meals)) setMeals(json.data.meals);
            if (typeof json.data.waterIntakeMl === 'number') setWaterIntakeMl(json.data.waterIntakeMl);
          }
        }

        // Fetch server attendance
        const attRes = await fetch('/api/attendance');
        if (attRes.ok) {
          const json = await attRes.json();
          if (json.logs && Array.isArray(json.logs)) {
            setAttendanceLogs(json.logs);
          }
        }
      } catch (err) {
        console.warn('Backend offline or starting up, using local state:', err);
        setBackendOnline(false);
      }
    }

    initBackendSync();
  }, []);

  // Synchronize document root background, dynamic CSS variables & dark class
  useEffect(() => {
    const pal = THEME_PALETTES[currentPalette] || THEME_PALETTES['cyber-green'];
    const root = document.documentElement;

    root.style.setProperty('--accent-primary', pal.primaryColor);
    root.style.setProperty('--accent-secondary', pal.secondaryColor);
    root.style.setProperty('--accent-hover', pal.primaryHover);
    root.style.setProperty('--accent-text-on', pal.primaryTextOnAccent);
    root.style.setProperty('--accent-glow', pal.accentGlow);
    root.style.setProperty('--accent-badge-bg', pal.badgeBg);
    root.style.setProperty('--accent-badge-border', pal.badgeBorder);
    root.style.setProperty('--accent-badge-text', pal.badgeText);
    root.style.setProperty('--accent-subtle', pal.accentSubtle || pal.badgeBg);
    root.style.setProperty('--accent-subtle-border', pal.accentSubtleBorder || pal.badgeBorder);

    if (isDark) {
      root.classList.add('dark');
      document.body.className = 'antialiased transition-colors duration-300';
      document.body.style.backgroundColor = pal.darkCanvasBg;
      document.body.style.color = '#F4F4F5';
    } else {
      root.classList.remove('dark');
      document.body.className = 'antialiased transition-colors duration-300';
      document.body.style.backgroundColor = pal.lightCanvasBg;
      document.body.style.color = '#18181B';
    }
  }, [currentPalette, isDark]);

  // Handle Palette Switch with audio & notification
  const handleSelectPalette = (paletteId: ThemePaletteId) => {
    setCurrentPalette(paletteId);
    const pal = THEME_PALETTES[paletteId];
    setActiveNotification({
      id: `theme-switch-${Date.now()}`,
      title: `${pal.emoji} ${pal.name} Activated`,
      body: `Style updated to ${pal.subtitle}. Experience the new athletic aesthetic!`,
      category: 'system',
    });
  };

  // Initial welcome notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveNotification({
        id: 'notif-welcome',
        title: '🔥 Welcome back, Marcus!',
        body: 'Push Hypertrophy routine is scheduled for today at 6:00 PM. Target: 18-Day Streak!',
        category: 'workout',
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Theme Toggle Handler
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // User Role Switcher
  const handleToggleRole = () => {
    const nextRole = userRole === 'member' ? 'owner' : 'member';
    setUserRole(nextRole);
    setActiveNotification({
      id: `role-switch-${Date.now()}`,
      title: nextRole === 'owner' ? '🛡️ Admin Management Mode' : '👤 Gym Member Mode',
      body:
        nextRole === 'owner'
          ? 'Full front desk check-in, real-time gym capacity, and member roster enabled.'
          : 'Personal digital gym pass, personal routines, and diet tracking enabled.',
      category: 'system',
    });
  };

  // Workouts Handlers
  const handleSaveRoutine = async (newRoutine: WorkoutRoutine) => {
    setRoutines((prev) => [newRoutine, ...prev]);

    try {
      await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoutine),
      });
    } catch (e) {
      console.warn('Could not persist routine to server:', e);
    }

    setActiveNotification({
      id: `routine-${Date.now()}`,
      title: '⚡ Routine Created',
      body: `"${newRoutine.name}" added to your workout split library!`,
      category: 'workout',
    });
  };

  const handleLogCompletedWorkout = async (routineName: string, durationMin: number, totalVolume: number) => {
    // Increment member stats
    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentMemberId
          ? {
              ...m,
              currentStreak: m.currentStreak + 1,
              bestStreak: Math.max(m.bestStreak, m.currentStreak + 1),
              totalVisits: m.totalVisits + 1,
            }
          : m
      )
    );

    try {
      await fetch('/api/workout/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: currentMemberId,
          routineName,
          durationMin,
          totalVolumeKg: totalVolume,
        }),
      });
    } catch (e) {
      console.warn('Could not log workout session to server:', e);
    }

    setActiveNotification({
      id: `workout-done-${Date.now()}`,
      title: '🏆 Workout Session Logged!',
      body: `Completed ${routineName} in ${durationMin}m • Total volume: ${totalVolume.toLocaleString()} kg lifted!`,
      category: 'workout',
    });
  };

  // Daily Planner Handlers
  const handleToggleTask = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}/toggle`, { method: 'PATCH' });
    } catch (e) {
      console.warn('Could not toggle task on server:', e);
    }
  };

  const handleAddTask = async (newTask: Omit<ScheduledTask, 'id'>) => {
    const item: ScheduledTask = {
      ...newTask,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [item, ...prev]);

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (e) {
      console.warn('Could not persist task to server:', e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Could not delete task from server:', e);
    }
  };

  const handleToggleNotification = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, enabled: !n.enabled } : n))
    );
  };

  // Diet & Macro Tracker Handlers
  const handleAddMeal = async (newMeal: Omit<MealEntry, 'id'>) => {
    const item: MealEntry = {
      ...newMeal,
      id: `meal-${Date.now()}`,
    };
    setMeals((prev) => [item, ...prev]);

    try {
      await fetch('/api/diet/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (e) {
      console.warn('Could not persist meal to server:', e);
    }

    setActiveNotification({
      id: `meal-add-${Date.now()}`,
      title: '🥗 Meal Logged',
      body: `${newMeal.name} (+${newMeal.calories} kcal, ${newMeal.protein}g protein) added to ${newMeal.mealType}!`,
      category: 'nutrition',
    });
  };

  const handleDeleteMeal = async (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));

    try {
      await fetch(`/api/diet/meals/${mealId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Could not remove meal from server:', e);
    }
  };

  const handleUpdateWater = async (delta: number) => {
    setWaterIntakeMl((prev) => Math.max(0, prev + delta));

    try {
      await fetch('/api/diet/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl: delta }),
      });
    } catch (e) {
      console.warn('Could not persist water intake to server:', e);
    }
  };

  const handleResetWater = async () => {
    setWaterIntakeMl(0);

    try {
      await fetch('/api/diet/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });
    } catch (e) {
      console.warn('Could not reset water on server:', e);
    }
  };

  // Attendance Management Handlers
  const handleCheckInMember = async (memberId: string, method: 'QR_CODE' | 'MANUAL') => {
    const mem = members.find((m) => m.id === memberId);
    if (!mem) return;

    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              isCurrentlyInside: true,
              currentStreak: m.currentStreak + 1,
              bestStreak: Math.max(m.bestStreak, m.currentStreak + 1),
              totalVisits: m.totalVisits + 1,
              lastCheckIn: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : m
      )
    );

    const newLog: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId: mem.id,
      memberName: mem.name,
      avatarUrl: mem.avatarUrl,
      timestamp: new Date().toISOString(),
      dateStr: '2026-09-07',
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkInMethod: method,
      status: 'Checked-In',
    };
    setAttendanceLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, method }),
      });
    } catch (e) {
      console.warn('Could not log check-in to server:', e);
    }

    setActiveNotification({
      id: `checkin-${Date.now()}`,
      title: '✅ Access Granted: GymX Athletic Club',
      body: `Welcome, ${mem.name}! Checked in at ${newLog.timeStr}.`,
      category: 'system',
    });
  };

  const handleCheckOutMember = async (recordId: string) => {
    const log = attendanceLogs.find((l) => l.id === recordId);
    if (!log) return;

    setAttendanceLogs((prev) =>
      prev.map((l) => (l.id === recordId ? { ...l, status: 'Completed', durationMins: 75 } : l))
    );

    setMembers((prev) =>
      prev.map((m) => (m.id === log.memberId ? { ...m, isCurrentlyInside: false } : m))
    );

    try {
      await fetch('/api/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: log.memberId }),
      });
    } catch (e) {
      console.warn('Could not log check-out to server:', e);
    }

    setActiveNotification({
      id: `checkout-${Date.now()}`,
      title: '👋 Workout Session Concluded',
      body: `${log.memberName} has checked out. Session duration: ~75 mins. Great job!`,
      category: 'system',
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-black text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      {/* Toast Notification Banner */}
      <NotificationBanner
        notification={activeNotification}
        theme={theme}
        onDismiss={() => setActiveNotification(null)}
      />

      {/* Main Container: Clean, Modern, Responsive Max-w-4xl Layout */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto min-h-screen relative pb-16">
        {/* Top App Header */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          currentStreak={currentMember.currentStreak}
          onOpenSettings={() => setIsPaletteModalOpen(true)}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />

        {/* Unmissable Top Android APK Download & Install Callout Banner */}
        <div className="w-full px-3 sm:px-5 pt-3">
          <button
            onClick={() => {
              sounds.playClick();
              setIsInstallModalOpen(true);
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black font-display font-black text-xs sm:text-sm flex items-center justify-between shadow-xl shadow-emerald-500/20 active:scale-[0.99] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-black text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                📱
              </span>
              <div className="text-left">
                <span className="block font-black tracking-wide text-black text-xs sm:text-sm">
                  DOWNLOAD ANDROID APK / INSTALL APP
                </span>
                <span className="block text-[10px] font-normal text-zinc-900 font-mono">
                  Tap here to download .apk file or install on Android phone
                </span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-black text-emerald-400 text-xs font-mono font-black group-hover:scale-105 transition-transform flex items-center gap-1 shrink-0">
              INSTALL NOW →
            </span>
          </button>
        </div>

        {/* Dynamic Main Module Viewport */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto">
          {activeTab === 'workouts' && (
            <WorkoutsModule
              exerciseLibrary={exerciseLibrary}
              routines={routines}
              theme={theme}
              onSaveRoutine={handleSaveRoutine}
              onLogCompletedWorkout={handleLogCompletedWorkout}
            />
          )}

          {activeTab === 'planner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setPlannerSubMode('today');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-label-caps text-xs text-center transition-all cursor-pointer ${
                    plannerSubMode === 'today'
                      ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Today Performance HUD
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setPlannerSubMode('calendar');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-label-caps text-xs text-center transition-all cursor-pointer ${
                    plannerSubMode === 'calendar'
                      ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Calendar Planner ({tasks.length})
                </button>
              </div>

              {plannerSubMode === 'today' ? (
                <TodayWorkoutHub
                  routine={routines[0]}
                  scheduledTasks={tasks}
                  theme={theme}
                  onStartWorkout={(r) => setActiveLiveRoutine(r)}
                  onOpen1RMModal={() => setIs1RMCalcOpen(true)}
                  onOpenPlateCalc={() => setIsPlateCalcOpen(true)}
                  onOpenWarmupModal={() => setIsWarmupOpen(true)}
                  onToggleTaskComplete={handleToggleTask}
                  onOpenInstall={() => setIsInstallModalOpen(true)}
                />
              ) : (
                <DailyPlannerModule
                  tasks={tasks}
                  notifications={notifications}
                  theme={theme}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleNotification={handleToggleNotification}
                  onTriggerTestPush={(payload) => setActiveNotification(payload)}
                />
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <WorkoutsModule
              exerciseLibrary={exerciseLibrary}
              routines={routines}
              theme={theme}
              onSaveRoutine={handleSaveRoutine}
              onLogCompletedWorkout={handleLogCompletedWorkout}
              initialSubTab="analytics"
            />
          )}

          {activeTab === 'scanner' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Top Sub-Switcher between Food Scanner and Diet & Macros */}
              <div className="p-1 rounded-2xl border border-zinc-800 bg-zinc-950 flex items-center gap-1 shadow-md">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setScannerSubMode('camera');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    scannerSubMode === 'camera'
                      ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>AI Food Scanner</span>
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setScannerSubMode('diet');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    scannerSubMode === 'diet'
                      ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Daily Diet & Macros ({meals.length})</span>
                </button>
              </div>

              {scannerSubMode === 'camera' ? (
                <SmartFoodScannerModule
                  theme={theme}
                  onLogScannedMeal={handleAddMeal}
                  onNavigateToDiet={() => setScannerSubMode('diet')}
                />
              ) : (
                <DailyDietModule
                  meals={meals}
                  waterIntakeMl={waterIntakeMl}
                  waterTargetMl={waterTargetMl}
                  theme={theme}
                  onAddMeal={handleAddMeal}
                  onDeleteMeal={handleDeleteMeal}
                  onUpdateWater={handleUpdateWater}
                  onResetWater={handleResetWater}
                  onNavigateToScanner={() => setScannerSubMode('camera')}
                />
              )}
            </div>
          )}

          {activeTab === 'diet' && (
            <div className="space-y-4 animate-fadeIn">
              <DailyDietModule
                meals={meals}
                waterIntakeMl={waterIntakeMl}
                waterTargetMl={waterTargetMl}
                theme={theme}
                onAddMeal={handleAddMeal}
                onDeleteMeal={handleDeleteMeal}
                onUpdateWater={handleUpdateWater}
                onResetWater={handleResetWater}
                onNavigateToScanner={() => {
                  setActiveTab('scanner');
                  setScannerSubMode('camera');
                }}
              />
            </div>
          )}

          {activeTab === 'attendance' && (
            <AttendanceModule
              currentMember={currentMember}
              allMembers={members}
              attendanceLogs={attendanceLogs}
              userRole={userRole}
              theme={theme}
              onCheckInMember={handleCheckInMember}
              onCheckOutMember={handleCheckOutMember}
            />
          )}
        </main>

        {/* Floating Mobile Android Install Prompt Bar */}
        {!isStandalone && !dismissInstallBanner && (
          <aside
            aria-label="Install App Prompt"
            className="fixed bottom-20 left-3 right-3 z-40 max-w-md mx-auto bg-zinc-950/95 border-2 border-emerald-500/60 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2.5 animate-fadeIn"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="font-display text-xs font-black text-white block leading-tight truncate">
                  Install GymX Android App
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  Add to home screen in 1-tap
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  sounds.playClick();
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choice: any) => {
                      if (choice.outcome === 'accepted') {
                        setIsStandalone(true);
                      }
                    });
                  } else {
                    setIsInstallModalOpen(true);
                  }
                }}
                className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-xs uppercase cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/30 flex items-center gap-1"
              >
                Install
              </button>
              <button
                onClick={() => setDismissInstallBanner(true)}
                className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer active:scale-90"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}

        {/* Bottom Tab Navigation Bar */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />

        {/* Live Active Workout Session Modal */}
        {activeLiveRoutine && (
          <ActiveWorkoutSessionModal
            routine={activeLiveRoutine}
            exercisesMap={exerciseLibrary.reduce((acc, ex) => ({ ...acc, [ex.id]: ex }), {})}
            allExercises={exerciseLibrary}
            theme={theme}
            onFinishWorkout={(routineName, durationMin, totalVolume) => {
              handleLogCompletedWorkout(routineName, durationMin, totalVolume);
              setActiveLiveRoutine(null);
            }}
            onClose={() => setActiveLiveRoutine(null)}
          />
        )}

        {/* Standalone Problem Solver Modals */}
        {isPlateCalcOpen && (
          <PlateCalculatorModal
            initialWeightKg={80}
            theme={theme}
            onClose={() => setIsPlateCalcOpen(false)}
          />
        )}
        {is1RMCalcOpen && (
          <OneRepMaxModal
            initialWeightKg={80}
            initialReps={8}
            theme={theme}
            onClose={() => setIs1RMCalcOpen(false)}
          />
        )}
        {isWarmupOpen && (
          <WarmUpPyramidModal
            workingWeightKg={85}
            exerciseName="Barbell Compound Lift"
            theme={theme}
            onClose={() => setIsWarmupOpen(false)}
          />
        )}

        {/* Settings & Theme Palette Switcher Modal */}
        <ThemePaletteSelector
          currentPalette={currentPalette}
          onSelectPalette={handleSelectPalette}
          isOpen={isPaletteModalOpen}
          onClose={() => setIsPaletteModalOpen(false)}
          isDark={isDark}
          isMuted={isMuted}
          onToggleMuted={handleToggleMuted}
        />

        {/* Mobile PWA Install & QR Code Modal */}
        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
          onInstallSuccess={() => {
            setActiveNotification({
              id: `install-${Date.now()}`,
              title: '🎉 GymX App Installed',
              body: 'GymX has been successfully added to your device home screen!',
              category: 'system',
            });
          }}
        />
      </div>
    </div>
  );
}
