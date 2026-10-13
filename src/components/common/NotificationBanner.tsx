import React, { useEffect } from 'react';
import { Bell, X, CheckCircle, Zap } from 'lucide-react';
import { ThemeMode } from '../../types/gym';

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  category?: 'workout' | 'nutrition' | 'water' | 'recovery';
}

interface NotificationBannerProps {
  notification: PushNotificationPayload | null;
  onDismiss: () => void;
  theme: ThemeMode;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  theme,
}) => {
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div
      id="simulated-push-notification"
      className="fixed top-3 left-3 right-3 z-50 max-w-sm mx-auto animate-in slide-in-from-top-6 duration-300"
    >
      <div
        className={`p-3.5 rounded-2xl border shadow-2xl flex items-start gap-3 transition-all ${
          isDark
            ? 'bg-zinc-950 border-emerald-500/40 text-zinc-100 shadow-black ring-1 ring-emerald-500/30'
            : 'bg-white border-emerald-400 text-zinc-900 shadow-md ring-1 ring-emerald-500/20'
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
              GYMX SMART PUSH
            </span>
            <span className="text-[10px] text-zinc-500">Just now</span>
          </div>
          <h4 className="text-xs font-bold mt-0.5 truncate">{notification.title}</h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
            {notification.body}
          </p>
        </div>

        <button
          id="close-notif-btn"
          onClick={onDismiss}
          className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
