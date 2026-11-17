import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Share2,
  MoreVertical,
  PlusSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerNativeInstall: () => Promise<boolean>;
  isStandalone: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerNativeInstall,
  isStandalone,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'apk' | 'qr'>('direct');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [installAttempted, setInstallAttempted] = useState(false);

  const rawOrigin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://gymx.app';
  const appUrl = rawOrigin.includes('ais-dev-')
    ? rawOrigin.replace('ais-dev-', 'ais-pre-')
    : rawOrigin;

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(appUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#10b981',
        light: '#09090b',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      sounds.playClick();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDirectInstall = async () => {
    sounds.playCheckInSuccess();
    setInstallAttempted(true);
    await onTriggerNativeInstall();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-base text-white leading-tight">
                Install GymX on Phone
              </h2>
              <p className="text-[11px] text-zinc-400">
                Android App • 1-Tap Install / APK / QR
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Close install modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="p-2 bg-zinc-900/40 border-b border-zinc-800 grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('direct');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Direct Install</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('apk');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('qr');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-950/50'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'direct' && (
            <div className="space-y-4">
              {isStandalone ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-1.5">
                  <Sparkles className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-sm font-black text-emerald-300">
                    GymX App Already Installed!
                  </p>
                  <p className="text-xs text-zinc-300">
                    Aap is waqt standalone installed app mode mein use kar rahe hain.
                  </p>
                </div>
              ) : deferredPrompt ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                      Ready for 1-Tap Install
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      NATIVE APP
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Neeche button dabate hi GymX seedha aapke Android home screen / app drawer mein install ho jayegi (bina browser bar ke).
                  </p>
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <Download className="w-4 h-4" />
                    <span>1-Tap Install GymX on Android</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Android Chrome Manual Install (2 Steps)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">PWA</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {installAttempted
                      ? 'Browser ne auto prompt nahi dikhaya — neeche diye 2 easy steps follow karein:'
                      : 'Agar aap laptop ya preview frame mein hain, to link phone ke Chrome mein khol kar neeche diye steps follow karein:'}
                  </p>
                </div>
              )}

              {/* Step-by-Step Guide */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    Phone par <strong className="text-white">Google Chrome</strong> mein yeh link open karein aur top-right mein{' '}
                    <MoreVertical className="w-3.5 h-3.5 inline text-emerald-400" />{' '}
                    <strong className="text-white">3 dots menu</strong> dabayein.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mr-1" />
                    <strong className="text-white">"Install app"</strong> ya{' '}
                    <strong className="text-white">"Add to Home screen"</strong> par tap karein — GymX real mobile app ki tarah install ho jayegi!
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    iOS
                  </div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    iPhone (Safari) par <Share2 className="w-3.5 h-3.5 inline text-zinc-200" />{' '}
                    <strong className="text-zinc-200">Share</strong> →{' '}
                    <strong className="text-zinc-200">"Add to Home Screen"</strong> karein.
                  </div>
                </div>
              </div>

              {/* Copy Link Box */}
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  App Link (Phone Chrome mein paste karein)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                    Android .APK Package Builder
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    APK READY
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Agar aapko installable <strong className="text-white">.apk file</strong> chahiye, to neeche button se PWABuilder par ja kar 1 click mein signed Android APK download kar sakte hain.
                </p>
              </div>

              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-950/50"
              >
                <Download className="w-4 h-4" />
                <span>Generate & Download .APK (PWABuilder)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="space-y-2 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <p className="font-bold text-white">APK kaise banayein (Steps):</p>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-400">
                  <li>Upar wale green button par tap karein (aapka app URL auto-fill hoga).</li>
                  <li>PWABuilder par <strong className="text-zinc-200">"Package For Stores"</strong> → <strong className="text-zinc-200">"Android"</strong> select karein.</li>
                  <li><strong className="text-zinc-200">"Download Package"</strong> dabayein — zip file mein signed <code className="text-emerald-400">.apk</code> mil jayegi.</li>
                  <li>Note: Live Vercel/Netlify ya Shared App URL par PWABuilder sabse best kaam karta hai.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Apne phone ke camera ya QR scanner se yeh code scan karein aur seedha phone Chrome mein open karke install kar lein:
              </p>

              <div className="inline-flex p-4 rounded-2xl bg-zinc-900 border-2 border-emerald-500/40 shadow-xl">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="GymX Phone Install QR Code"
                    className="w-48 h-48 rounded-xl"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-500">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-left">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono truncate focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
