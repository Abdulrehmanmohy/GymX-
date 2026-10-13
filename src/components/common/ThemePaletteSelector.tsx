import React from 'react';
import { Palette, Check, Sparkles, X, Volume2, VolumeX } from 'lucide-react';
import { THEME_PALETTES, ThemePaletteId } from '../../utils/themePalettes';
import { sounds } from '../../utils/audio';

interface ThemePaletteSelectorProps {
  currentPalette: ThemePaletteId;
  onSelectPalette: (paletteId: ThemePaletteId) => void;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isMuted?: boolean;
  onToggleMuted?: () => void;
}

export const ThemePaletteSelector: React.FC<ThemePaletteSelectorProps> = ({
  currentPalette,
  onSelectPalette,
  isOpen,
  onClose,
  isDark,
  isMuted = false,
  onToggleMuted,
}) => {
  if (!isOpen) return null;

  const handleSelect = (id: ThemePaletteId) => {
    sounds.playClick();
    onSelectPalette(id);
  };

  const paletteList = Object.values(THEME_PALETTES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fadeIn">
      <div
        id="theme-palette-modal"
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-5 sm:p-6 transition-all relative ${
          isDark
            ? 'bg-[#121316] border-zinc-800 text-zinc-100 shadow-black/90'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-all ${
            isDark
              ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border-zinc-300'
          }`}
          aria-label="Close settings modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner"
            style={{
              backgroundColor: 'var(--accent-badge-bg)',
              borderColor: 'var(--accent-badge-border)',
            }}
          >
            <Palette className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight font-display flex items-center gap-2">
              App Settings & Themes
            </h3>
            <p className="text-xs text-zinc-400">
              Customize colors and sound preferences.
            </p>
          </div>
        </div>

        {/* Sound Toggle Row */}
        {onToggleMuted && (
          <div
            className={`mb-4 p-3 rounded-2xl border flex items-center justify-between transition-all ${
              isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isMuted ? 'bg-zinc-800 text-zinc-500' : 'bg-accent/20 text-accent'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold">{isMuted ? 'Sound Effects Muted' : 'Athletic Sound Effects'}</p>
                <p className="text-[10px] text-zinc-400">Audio feedback on clicks & sets</p>
              </div>
            </div>
            <button
              onClick={() => {
                onToggleMuted();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isMuted
                  ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'bg-accent text-zinc-950 font-extrabold shadow-sm'
              }`}
            >
              {isMuted ? 'Turn On' : 'Active'}
            </button>
          </div>
        )}

        <div className="mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Color Palette</p>
        </div>

        {/* Palette Options List */}
        <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
          {paletteList.map((palette) => {
            const isSelected = currentPalette === palette.id;

            return (
              <button
                key={palette.id}
                onClick={() => handleSelect(palette.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-zinc-900/90 border-2'
                      : 'bg-zinc-50 border-2'
                    : isDark
                    ? 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                    : 'bg-zinc-50/50 hover:bg-zinc-100/80 border-zinc-200 hover:border-zinc-300'
                }`}
                style={{
                  borderColor: isSelected ? palette.primaryColor : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Swatch Pill */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm shrink-0 border"
                    style={{
                      background: `linear-gradient(135deg, ${palette.primaryColor} 0%, ${palette.primaryHover} 100%)`,
                      borderColor: palette.primaryColor,
                    }}
                  >
                    <span>{palette.emoji}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold tracking-tight">
                        {palette.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      {palette.subtitle}
                    </p>
                  </div>
                </div>

                {/* Selected Checkmark or Color Dot */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                    style={{ backgroundColor: palette.primaryColor }}
                  />
                  {isSelected ? (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-xs"
                      style={{
                        backgroundColor: palette.primaryColor,
                        color: palette.primaryTextOnAccent,
                      }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-zinc-700/50 group-hover:border-zinc-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-3 h-3 text-zinc-400" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium">
            Active: <strong className="text-accent">{THEME_PALETTES[currentPalette].name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold text-xs bg-accent text-zinc-950 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
