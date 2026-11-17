import React from 'react';
import { ActiveTab, ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';
import { Zap, Dumbbell, Camera, UserCheck } from 'lucide-react';

export type TabType = ActiveTab;

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab?: (tab: TabType) => void;
  onTabChange?: (tab: TabType) => void;
  theme: ThemeMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onTabChange,
}) => {
  const handleTabSelect = (tab: TabType) => {
    sounds.playClick();
    if (onTabChange) onTabChange(tab);
    else if (onChangeTab) onChangeTab(tab);
  };

  const navItems = [
    { id: 'planner' as TabType, label: 'Today', icon: Zap },
    { id: 'workouts' as TabType, label: 'Train', icon: Dumbbell },
    { id: 'scanner' as TabType, label: 'Scanner', icon: Camera },
    { id: 'attendance' as TabType, label: 'Desk', icon: UserCheck },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-2 py-1.5 max-w-4xl mx-auto bg-black/95 backdrop-blur-md border-t border-zinc-800/90 shadow-[0_-8px_28px_rgba(0,0,0,0.75)]"
      style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => handleTabSelect(item.id)}
            className="flex-1 py-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-90 cursor-pointer"
          >
            <div
              className={`px-4 py-1 rounded-full transition-all duration-200 ${
                isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <IconComponent
                className="w-5 h-5"
                strokeWidth={isActive ? 2.4 : 1.9}
              />
            </div>
            <span
              className={`text-[11px] leading-none tracking-tight transition-colors ${
                isActive ? 'text-emerald-400 font-bold' : 'text-zinc-500 font-medium'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
