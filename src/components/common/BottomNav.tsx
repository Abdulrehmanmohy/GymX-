import React from 'react';
import { ActiveTab, ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';
import { Zap, Dumbbell, BarChart3, Camera, Utensils, UserCheck } from 'lucide-react';

export type TabType = ActiveTab;

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab?: (tab: TabType) => void;
  onTabChange?: (tab: TabType) => void;
  theme: ThemeMode;
  unreadNotifsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onTabChange,
  theme,
  unreadNotifsCount = 0,
}) => {
  const isDark = theme === 'dark';

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
      className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-2 py-2 max-w-4xl mx-auto bg-black border-t border-zinc-800 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] pb-safe"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => handleTabSelect(item.id)}
            className={`flex-1 py-1.5 mx-0.5 flex flex-col items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
              isActive
                ? 'text-black bg-emerald-500 font-black rounded-xl shadow-[0_0_18px_rgba(16,185,129,0.55)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <IconComponent
              className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="font-label-caps text-[10px] mt-0.5 tracking-wider font-bold">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
