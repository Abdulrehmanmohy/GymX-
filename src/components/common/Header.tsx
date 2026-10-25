import React from 'react';
import { ThemeMode, UserRole } from '../../types/gym';
import { Shield, User, Settings, Flame, Smartphone } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  currentStreak: number;
  onOpenSettings?: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  userRole,
  onToggleRole,
  currentStreak,
  onOpenSettings,
  onOpenInstall,
}) => {
  const isDark = theme === 'dark';

  const handleRoleSwitch = () => {
    sounds.playClick();
    onToggleRole();
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 flex justify-between items-center w-full px-4 h-16 max-w-4xl mx-auto bg-black border-b border-zinc-800 shadow-2xl"
    >
      {/* Leading: Athlete Avatar & KINETIC Brand */}
      <div className="flex items-center space-x-3">
        <div className="relative w-9 h-9 rounded-full ring-2 ring-emerald-500/50 overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            alt="Athlete Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80';
            }}
          />
        </div>
        <div>
          <span className="font-display font-black text-xl tracking-wider text-emerald-400 block leading-none">
            GymX
          </span>
          <span className="font-label-caps text-[10px] text-zinc-400 tracking-widest uppercase">
            Performance Pro
          </span>
        </div>
      </div>

      {/* Trailing Controls: Live Sync, Streak, Role Desk Toggle */}
      <div className="flex items-center space-x-2">
        {/* Streak Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
          <span className="text-xs">🔥</span>
          <span className="font-label-caps text-[10px] text-white">{currentStreak}d</span>
        </div>

        {/* Live Sync Badge */}
        <div className="hidden xs:flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-label-caps text-[10px] text-emerald-400 font-bold">SYNC</span>
        </div>

        {/* Staff Desk / Member Toggle */}
        <button
          onClick={handleRoleSwitch}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
            userRole === 'owner'
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
          }`}
          title="Switch between Athlete Member and Gym Desk"
        >
          {userRole === 'owner' ? (
            <>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-mono text-[11px]">Desk</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline font-mono text-[11px]">Member</span>
            </>
          )}
        </button>

        {/* Install on Mobile App button */}
        {onOpenInstall && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenInstall();
            }}
            className="h-9 px-3 rounded-xl flex items-center justify-center gap-1.5 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
            title="Install GymX APK on Android"
          >
            <Smartphone className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span className="text-[11px] font-black uppercase font-mono tracking-tight">Install APK</span>
          </button>
        )}

        {/* Settings button */}
        {onOpenSettings && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors active:scale-95 cursor-pointer"
            title="Theme Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
