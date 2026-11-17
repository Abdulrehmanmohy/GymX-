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
import { getLocalDateStr } from './utils/date';
import { Camera, Utensils, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'gymx_app_state_v1';

interface PersistedGymState {
  theme?: ThemeMode;
  userRole?: UserRole;
  currentPalette?: ThemePaletteId;
  routines?: WorkoutRoutine[];
  tasks?: ScheduledTask[];
  notifications?: SmartNotification[];
  meals?: MealEntry[];
  waterIntakeMl?: number;
  members?: GymMember[];
  attendanceLogs?: AttendanceRecord[];
}

function loadPersistedState(): PersistedGymState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [savedInitial] = useState<PersistedGymState | null>(() => loadPersistedState());

  // Navigation & Viewport State (default to Today tab matching BottomNav)
  const [activeTab, setActiveTab] = useState<ActiveTab>('planner');
  const [scannerSubMode, setScannerSubMode] = useState<'camera' | 'diet'>('camera');
  const [theme, setTheme] = useState<ThemeMode>(() => savedInitial?.theme || 'dark');
  const [userRole, setUserRole] = useState<UserRole>(() => savedInitial?.userRole || 'member');
  const [activeNotification, setActiveNotification] = useState<PushNotificationPayload | null>(null);

  // Athletic Theme Palette State & Sound State
  const [currentPalette, setCurrentPalette] = useState<ThemePaletteId>(
    () => savedInitial?.currentPalette || 'cyber-green'
  );
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getIsMuted());

  // KINETIC Sub-mode & Modal States
  const [plannerSubMode, setPlannerSubMode] = useState<'today' | 'calendar'>('today');
  const [activeLiveRoutine, setActiveLiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState<boolean>(false);
  const [is1RMCalcOpen, setIs1RMCalcOpen] = useState<boolean>(false);
  const [isWarmupOpen, setIsWarmupOpen] = useState<boolean>(false);

  // Temporary Phone Install / APK / QR State
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [dismissInstallBanner, setDismissInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    const win = window as unknown as { __deferredInstallPrompt?: BeforeInstallPromptEvent | null };

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (win.__deferredInstallPrompt) {
      setDeferredPrompt(win.__deferredInstallPrompt);
    }

    const handleInstallReady = () => {
      if (win.__deferredInstallPrompt) {
        setDeferredPrompt(win.__deferredInstallPrompt);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      win.__deferredInstallPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      win.__deferredInstallPrompt = null;
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    };

    window.addEventListener('gymx-install-ready', handleInstallReady);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('gymx-install-ready', handleInstallReady);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerNativeInstall = async (): Promise<boolean> => {
    const win = window as unknown as { __deferredInstallPrompt?: BeforeInstallPromptEvent | null };
    const promptEvent = deferredPrompt || win.__deferredInstallPrompt;
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        win.__deferredInstallPrompt = null;
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Direct 1-tap phone install when Chrome prompt is ready; opens guide/QR/APK modal otherwise
  const handleInstallClick = async () => {
    const win = window as unknown as { __deferredInstallPrompt?: BeforeInstallPromptEvent | null };
    if (deferredPrompt || win.__deferredInstallPrompt) {
      const accepted = await handleTriggerNativeInstall();
      if (accepted) return;
    }
    setIsInstallModalOpen(true);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleToggleMuted = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    if (!next) sounds.playClick();
  };

  // Application Data States
  const [exerciseLibrary] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(
    () => (Array.isArray(savedInitial?.routines) && savedInitial.routines.length > 0 ? savedInitial.routines : INITIAL_ROUTINES)
  );
  const [tasks, setTasks] = useState<ScheduledTask[]>(
    () => (Array.isArray(savedInitial?.tasks) ? savedInitial.tasks : INITIAL_SCHEDULED_TASKS)
  );
  const [notifications, setNotifications] = useState<SmartNotification[]>(
    () => (Array.isArray(savedInitial?.notifications) ? savedInitial.notifications : INITIAL_NOTIFICATIONS)
  );
  const [meals, setMeals] = useState<MealEntry[]>(
    () => (Array.isArray(savedInitial?.meals) ? savedInitial.meals : INITIAL_MEALS)
  );
  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(
    () => (typeof savedInitial?.waterIntakeMl === 'number' ? savedInitial.waterIntakeMl : 1750)
  );
  const waterTargetMl = 3000;
  const [members, setMembers] = useState<GymMember[]>(
    () => (Array.isArray(savedInitial?.members) && savedInitial.members.length > 0 ? savedInitial.members : INITIAL_MEMBERS)
  );
  const currentMemberId = 'mem-101'; // Marcus Vance
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(
    () => (Array.isArray(savedInitial?.attendanceLogs) ? savedInitial.attendanceLogs : INITIAL_ATTENDANCE_LOGS)
  );

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];
  const isDark = theme === 'dark';

  // Persist user state locally so sessions survive reloads and serverless cold starts
  useEffect(() => {
    try {
      const payload: PersistedGymState = {
        theme,
        userRole,
        currentPalette,
        routines,
        tasks,
        notifications,
        meals,
        waterIntakeMl,
        members,
        attendanceLogs,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [theme, userRole, currentPalette, routines, tasks, notifications, meals, waterIntakeMl, members, attendanceLogs]);

  // Synchronize with Express REST Backend on mount when no local snapshot exists yet
  useEffect(() => {
    if (savedInitial) return;

    async function initBackendSync() {
      try {
        const [routinesRes, tasksRes, dietRes, attRes] = await Promise.all([
          fetch('/api/routines'),
          fetch('/api/tasks'),
          fetch('/api/diet'),
          fetch('/api/attendance'),
        ]);

        if (routinesRes.ok) {
          const json = await routinesRes.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setRoutines(json.data);
          }
        }

        if (tasksRes.ok) {
          const json = await tasksRes.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setTasks(json.data);
          }
        }

        if (dietRes.ok) {
          const json = await dietRes.json();
          if (json.data) {
            if (Array.isArray(json.data.meals)) setMeals(json.data.meals);
            if (typeof json.data.waterIntakeMl === 'number') setWaterIntakeMl(json.data.waterIntakeMl);
          }
        }

        if (attRes.ok) {
          const json = await attRes.json();
          if (json.logs && Array.isArray(json.logs)) {
            setAttendanceLogs(json.logs);
          }
        }
      } catch (err) {
        console.warn('Backend offline or starting up, using local state:', err);
      }
    }

    initBackendSync();
  }, [savedInitial]);

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

    const todayStr = getLocalDateStr();
    const alreadyCheckedIn =
      mem.isCurrentlyInside ||
      attendanceLogs.some(
        (l) => l.memberId === mem.id && l.dateStr === todayStr && l.status === 'Checked-In'
      );

    if (alreadyCheckedIn) {
      setActiveNotification({
        id: `checkin-dup-${Date.now()}`,
        title: 'ℹ️ Already Checked In',
        body: `${mem.name} is already marked present on the gym floor.`,
        category: 'system',
      });
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              isCurrentlyInside: true,
              currentStreak: m.currentStreak + 1,
              bestStreak: Math.max(m.bestStreak, m.currentStreak + 1),
              totalVisits: m.totalVisits + 1,
              lastCheckIn: `Today at ${timeStr}`,
            }
          : m
      )
    );

    const newLog: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId: mem.id,
      memberName: mem.name,
      avatarUrl: mem.avatarUrl,
      timestamp: now.toISOString(),
      dateStr: todayStr,
      timeStr,
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

  const handleCheckOutMember = async (recordOrMemberId: string) => {
    const activeLog = attendanceLogs.find(
      (l) =>
        l.id === recordOrMemberId ||
        (l.memberId === recordOrMemberId && l.status === 'Checked-In')
    );

    const targetMemberId = activeLog ? activeLog.memberId : recordOrMemberId;
    const member = members.find((m) => m.id === targetMemberId);

    if (!activeLog && (!member || !member.isCurrentlyInside)) return;

    const durationMins = activeLog
      ? Math.max(15, Math.round((Date.now() - new Date(activeLog.timestamp).getTime()) / (1000 * 60)))
      : 60;

    if (activeLog) {
      setAttendanceLogs((prev) =>
        prev.map((l) =>
          l.id === activeLog.id ? { ...l, status: 'Completed', durationMins } : l
        )
      );
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === targetMemberId ? { ...m, isCurrentlyInside: false } : m))
    );

    try {
      await fetch('/api/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: targetMemberId }),
      });
    } catch (e) {
      console.warn('Could not log check-out to server:', e);
    }

    setActiveNotification({
      id: `checkout-${Date.now()}`,
      title: '👋 Workout Session Concluded',
      body: `${activeLog?.memberName || member?.name || 'Member'} has checked out. Session duration: ~${durationMins} mins. Great job!`,
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

      {/* Main Container: Clean Mobile-First Responsive Layout */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto min-h-[100dvh] relative pb-20 overflow-x-hidden">
        {/* Top App Header */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          currentStreak={currentMember.currentStreak}
          onOpenSettings={() => setIsPaletteModalOpen(true)}
          onOpenInstall={handleInstallClick}
          canDirectInstall={Boolean(deferredPrompt)}
        />

        {/* Dynamic Main Module Viewport */}
        <main className="flex-1 p-3 sm:p-5">
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
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    plannerSubMode === 'today'
                      ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setPlannerSubMode('calendar');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    plannerSubMode === 'calendar'
                      ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Planner ({tasks.length})
                </button>
              </div>

              {plannerSubMode === 'today' ? (
                <TodayWorkoutHub
                  routine={routines[0]}
                  scheduledTasks={tasks}
                  waterIntakeMl={waterIntakeMl}
                  waterTargetMl={waterTargetMl}
                  totalCalories={meals.reduce((sum, m) => sum + m.calories, 0)}
                  theme={theme}
                  onStartWorkout={(r) => setActiveLiveRoutine(r)}
                  onOpen1RMModal={() => setIs1RMCalcOpen(true)}
                  onOpenPlateCalc={() => setIsPlateCalcOpen(true)}
                  onOpenWarmupModal={() => setIsWarmupOpen(true)}
                  onAddWater={handleUpdateWater}
                  onToggleTaskComplete={handleToggleTask}
                  onOpenInstall={handleInstallClick}
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

        {/* Bottom Tab Navigation Bar */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} theme={theme} />

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

        {/* Temporary Floating Install Bar above BottomNav */}
        {!isStandalone && !dismissInstallBanner && (
          <div className="fixed bottom-18 left-0 right-0 z-40 px-3 pointer-events-none">
            <div className="max-w-md mx-auto bg-zinc-950/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 pointer-events-auto">
              <button
                onClick={() => {
                  sounds.playClick();
                  handleInstallClick();
                }}
                className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-white block truncate">
                    {deferredPrompt ? 'Install GymX App (1-Tap Ready)' : 'Phone mein App Install karein'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block truncate">
                    {deferredPrompt
                      ? 'Click karte hi direct phone mein install hoga!'
                      : 'Tap karein → Chrome Install, QR ya APK'}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    sounds.playClick();
                    handleInstallClick();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-display font-black text-[11px] cursor-pointer active:scale-95"
                >
                  Install
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setDismissInstallBanner(true);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                  aria-label="Dismiss install banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phone Install / APK / QR Modal */}
        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
          onTriggerNativeInstall={handleTriggerNativeInstall}
          isStandalone={isStandalone}
        />
      </div>
    </div>
  );
}
