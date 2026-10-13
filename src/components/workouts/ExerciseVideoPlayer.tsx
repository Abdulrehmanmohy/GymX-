import React, { useState, useRef, useEffect } from 'react';
import { Exercise, ThemeMode } from '../../types/gym';
import { Play, Pause, RotateCcw, Sparkles, CheckCircle2, AlertTriangle, Eye, ShieldCheck, Gauge, Activity } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { AnimatedExerciseCanvas } from './AnimatedExerciseCanvas';

interface ExerciseVideoPlayerProps {
  exercise: Exercise;
  theme: ThemeMode;
  mode?: 'full' | 'compact' | 'mini';
  autoPlay?: boolean;
}

export const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = ({
  exercise,
  theme,
  mode = 'full',
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isSlowMotion, setIsSlowMotion] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(exercise.videoDurationSec || 5);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<'animated' | 'video'>('animated');

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = isSlowMotion ? 0.5 : 1.0;
    }
  }, [isSlowMotion]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleSlowMo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    setIsSlowMotion(!isSlowMotion);
  };

  const handleRestart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  // Mini mode
  if (mode === 'mini') {
    return (
      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-black group">
        <AnimatedExerciseCanvas
          exercise={exercise}
          theme={theme}
          isPlaying={true}
          isSlowMotion={false}
          showTelemetry={false}
          className="w-full h-full"
        />
        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/90 text-[8px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
          LOOP
        </div>
      </div>
    );
  }

  // Compact mode
  if (mode === 'compact') {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-black group">
        {displayMode === 'animated' || videoFailed || !exercise.videoUrl ? (
          <AnimatedExerciseCanvas
            exercise={exercise}
            theme={theme}
            isPlaying={isPlaying}
            isSlowMotion={isSlowMotion}
            showTelemetry={true}
            className="w-full h-full"
          />
        ) : (
          <video
            ref={videoRef}
            src={exercise.videoUrl}
            poster={exercise.videoPoster}
            autoPlay={autoPlay}
            loop
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onError={() => {
              setVideoFailed(true);
              setDisplayMode('animated');
            }}
            className="w-full h-full object-cover"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-black/90 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/40 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Animated Technique
          </span>
          {isSlowMotion && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase font-mono">
              0.5x Slow-Mo
            </span>
          )}
        </div>

        {/* Hover Controls Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-950/60 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
          </button>
          <button
            onClick={toggleSlowMo}
            className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
              isSlowMotion
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-black/80 text-white border-zinc-700 hover:bg-black'
            }`}
            title="Toggle 0.5x Slow Motion"
          >
            {isSlowMotion ? '1.0x Normal' : '0.5x Slow-Mo'}
          </button>
        </div>
      </div>
    );
  }

  // Full detailed mode
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black overflow-hidden shadow-2xl space-y-3">
      {/* Visual Screen Area */}
      <div className="relative w-full aspect-video sm:aspect-[16/10] bg-black overflow-hidden flex items-center justify-center">
        {displayMode === 'animated' || videoFailed || !exercise.videoUrl ? (
          <AnimatedExerciseCanvas
            exercise={exercise}
            theme={theme}
            isPlaying={isPlaying}
            isSlowMotion={isSlowMotion}
            showTelemetry={true}
            className="w-full h-full"
          />
        ) : (
          <video
            ref={videoRef}
            src={exercise.videoUrl}
            poster={exercise.videoPoster}
            autoPlay={autoPlay}
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onError={() => {
              setVideoFailed(true);
              setDisplayMode('animated');
            }}
            className="w-full h-full object-cover"
          />
        )}

        {/* Top Video HUD Info */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/90 text-xs font-extrabold text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 font-mono shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Animated Movement Loop
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {exercise.videoUrl && !videoFailed && (
              <button
                onClick={() => {
                  sounds.playClick();
                  setDisplayMode(displayMode === 'animated' ? 'video' : 'animated');
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
              >
                {displayMode === 'animated' ? 'Video View' : 'Animated Biomechanics'}
              </button>
            )}

            <button
              onClick={toggleSlowMo}
              className={`px-2.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-md flex items-center gap-1 ${
                isSlowMotion
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-black/90 hover:bg-black text-white border-zinc-700'
              }`}
              title="Slow Motion (0.5x speed) to see exact joint angles and form"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{isSlowMotion ? '0.5x Active' : '0.5x Slow-Mo'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Video Progress Scrub Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-900">
          <div
            className="h-full bg-emerald-500 transition-all duration-100"
            style={{ width: `${isPlaying ? (isSlowMotion ? 100 : 75) : 0}%` }}
          />
        </div>
      </div>

      {/* Control Actions & Speed Toggles */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-950/50'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
            <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-all"
            title="Restart Loop"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSlowMo}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSlowMotion
                ? 'bg-amber-400 text-black border-amber-300 font-black'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isSlowMotion ? 'Slow-Mo (0.5x)' : 'Normal (1.0x)'}</span>
          </button>
        </div>
      </div>

      {/* Muscle Focus & Form Breakdown */}
      <div className="p-4 space-y-4">
        {/* Prime Execution Cue Banner */}
        {exercise.executionCue && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 flex items-start gap-3">
            <span className="p-1.5 rounded-lg bg-emerald-500 text-black shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                COACHING CUE & KINETIC PATH
              </span>
              <p className="text-xs font-medium text-white mt-0.5 leading-relaxed">
                {exercise.executionCue}
              </p>
            </div>
          </div>
        )}

        {/* Primary and Secondary Target Muscles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 font-mono">TARGET:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            {exercise.primaryMuscle}
          </span>
          {exercise.secondaryMuscles.map((sec) => (
            <span
              key={sec}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800"
            >
              {sec}
            </span>
          ))}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Step-by-Step Technique
          </h4>
          <ol className="space-y-2">
            {exercise.instructions.map((step, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs flex items-start gap-3 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Pro Form Tips & Biomechanics */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Biomechanics & Injury Prevention
          </h4>
          <div className="space-y-2">
            {exercise.formTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/15 text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
