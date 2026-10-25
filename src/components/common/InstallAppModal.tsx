import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Download, X, Copy, Check, QrCode, Sparkles, ExternalLink, Package } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'qr'>('install');

  // App production or development URL
  const appUrl =
    typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http') && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://ais-dev-gqmdzzdwqqnrtbvnfo3nvy-718851497432.asia-east1.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0a0a0c',
          light: '#10b981',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    sounds.playClick();
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTriggerInstall = async () => {
    sounds.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        onInstallSuccess?.();
        onClose();
      }
    } else {
      setActiveTab('install');
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white tracking-wide flex items-center gap-2">
              Android App & APK
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                PRO
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Install direct on Android phone or build APK</p>
          </div>
        </div>

        {/* Native 1-Tap Prompt button if available */}
        {deferredPrompt && (
          <button
            onClick={handleTriggerInstall}
            className="w-full mb-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-black" />
            1-Tap Install GymX on Android
          </button>
        )}

        {/* Mode Switcher */}
        <div className="grid grid-cols-3 gap-1.5 mb-4 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('install');
            }}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'install'
                ? 'bg-zinc-800 text-emerald-400 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Direct Install
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('apk');
            }}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-zinc-800 text-emerald-400 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Download APK
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('qr');
            }}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-zinc-800 text-emerald-400 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Scan QR
          </button>
        </div>

        {/* TAB 1: Direct Android Install (Recommended & Easiest) */}
        {activeTab === 'install' && (
          <div className="space-y-3 text-left">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                  Recommended: Instant WebAPK Install
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Android OS Chrome browser se bina kisi download ke direct official WebAPK app install kar deta hai — ye App Drawer, full-screen aur notifications ke sath native app banti hai.
              </p>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-zinc-200 font-bold text-xs block mb-2 font-mono">
                Android Phone Par 3 Aasan Steps:
              </span>
              <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside pl-0.5">
                <li>Apne phone ke <strong>Chrome browser</strong> mein ye app link open karein.</li>
                <li>Top-right mein <strong>3 dots (⋮)</strong> menu dabayein.</li>
                <li><strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par click karein.</li>
                <li>GymX direct phone par install ho jayega aur Play Store jaisa icon show hoga!</li>
              </ol>
            </div>

            {/* Copy Link Row */}
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1.5 px-3">
              <span className="text-xs text-zinc-400 truncate flex-1 font-mono">{appUrl}</span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Download APK File */}
        {activeTab === 'apk' && (
          <div className="space-y-3 text-left">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                  1-Click Android APK Generator
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  PWABuilder
                </span>
              </div>
              <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                Aap Microsoft & Google ke official <strong>PWABuilder</strong> tool se is app ka ready-to-install <strong>.apk</strong> file direct download kar sakte hain:
              </p>
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                <Package className="w-4 h-4 text-black" />
                <span>Open PWABuilder & Download .APK</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>
            </div>

            <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 space-y-1">
              <span className="text-zinc-200 font-bold block mb-1 font-mono">
                PWABuilder Par Tareeqa:
              </span>
              <p>1. Upar walay button par click karein.</p>
              <p>2. <strong>"Package for Stores"</strong> par tap karein.</p>
              <p>3. <strong>"Android"</strong> select karein aur <strong>"Download Package"</strong> dabayein.</p>
              <p>4. Signed <strong>app-release.apk</strong> aapke phone mein download ho jayegi!</p>
            </div>

            {/* Developer Bubblewrap CLI */}
            <div className="p-3 bg-black/60 border border-zinc-800 rounded-xl text-xs text-zinc-400 font-mono">
              <span className="text-emerald-400 block font-bold mb-1">Developer CLI (twa-manifest.json):</span>
              <code className="text-[11px] text-zinc-300 block bg-zinc-900 p-1.5 rounded border border-zinc-800">
                npx @bubblewrap/cli build
              </code>
            </div>
          </div>
        )}

        {/* TAB 3: QR Code Scanner */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-inner mb-3 flex flex-col items-center">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="GymX Mobile QR"
                  className="w-48 h-48 rounded-xl object-contain shadow-md"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-zinc-500 text-xs">
                  Generating QR...
                </div>
              )}
              <span className="text-[11px] text-zinc-400 mt-2 font-mono text-center">
                Phone camera se scan karein aur direct open karein
              </span>
            </div>

            {/* Copy Link Row */}
            <div className="w-full flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1.5 px-3">
              <span className="text-xs text-zinc-400 truncate flex-1 font-mono">{appUrl}</span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span>GymX Standalone Android PWA</span>
          <span className="text-emerald-400 font-mono">Offline Ready</span>
        </div>
      </div>
    </div>
  );
};
