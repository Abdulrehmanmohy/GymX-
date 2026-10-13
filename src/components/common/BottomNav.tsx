import React from 'react';
import { ActiveTab, ThemeMode } from '../../types/gym';
import { sounds } from '../../utils/audio';

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
    { id: 'planner' as TabType, label: 'Today', icon: 'bolt' },
    { id: 'workouts' as TabType, label: 'Train', icon: 'fitness_center' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: 'monitoring' },
    { id: 'scanner' as TabType, label: 'Scanner', icon: 'photo_camera' },
    { id: 'diet' as TabType, label: 'Diet', icon: 'restaurant' },
    { id: 'attendance' as TabType, label: 'Desk', icon: 'how_to_reg' },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-2 py-2 max-w-md mx-auto bg-black border-t border-zinc-800 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] pb-safe"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => handleTabSelect(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer ${
              isActive
                ? 'text-black bg-emerald-500 font-black rounded-xl px-2.5 py-1.5 shadow-[0_0_18px_rgba(16,185,129,0.55)]'
                : 'text-zinc-400 hover:text-white px-2 py-1'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-label-caps text-[9px] mt-0.5 tracking-wider">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
