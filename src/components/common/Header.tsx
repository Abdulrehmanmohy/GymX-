import React from 'react';
import { ThemeMode, UserRole } from '../../types/gym';
import { Shield, User, Settings, Smartphone } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
  currentStreak: number;
  onOpenSettings?: () => void;
  onOpenInstall?: () => void;
  canDirectInstall?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  onToggleRole,
  currentStreak,
  onOpenSettings,
  onOpenInstall,
  canDirectInstall,
}) => {
  const handleRoleSwitch = () => {
    sounds.playClick();
    onToggleRole();
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 flex justify-between items-center w-full px-3 sm:px-4 h-14 max-w-4xl mx-auto bg-black/95 backdrop-blur-md border-b border-zinc-800/80"
    >
      {/* Leading: Athlete Avatar & Brand */}
      <div className="flex items-center space-x-2 min-w-0">
        <div className="relative w-8 h-8 rounded-full ring-2 ring-emerald-500/50 overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
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
        <div className="min-w-0">
          <span className="font-display font-black text-lg tracking-wide text-emerald-400 block leading-none">
            GymX
          </span>
          <span className="text-[10px] text-zinc-400 font-medium block leading-tight mt-0.5">
            Fitness Club
          </span>
        </div>
      </div>

      {/* Trailing Controls: Install App, Streak, Role Toggle, Settings */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {onOpenInstall && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenInstall();
            }}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
              canDirectInstall
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950/50'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40'
            }`}
            title="Install GymX App on Phone"
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>{canDirectInstall ? 'Install' : 'Install App'}</span>
          </button>
        )}

        {/* Streak Pill */}
        <div className="hidden xs:flex sm:flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800">
          <span className="text-xs leading-none">🔥</span>
          <span className="font-mono font-bold text-[11px] text-white">{currentStreak}d</span>
        </div>

        {/* Staff Desk / Member Toggle */}
        <button
          onClick={handleRoleSwitch}
          className={`px-2 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
            userRole === 'owner'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
          }`}
          title="Switch between Member and Desk mode"
        >
          {userRole === 'owner' ? (
            <>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">Desk</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px]">Member</span>
            </>
          )}
        </button>

        {/* Settings button */}
        {onOpenSettings && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors active:scale-95 cursor-pointer"
            title="Theme & Sound Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
