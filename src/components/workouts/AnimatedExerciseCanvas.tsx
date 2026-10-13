import React, { useEffect, useState, useRef } from 'react';
import { Exercise, ThemeMode } from '../../types/gym';

interface AnimatedExerciseCanvasProps {
  exercise: Exercise;
  theme?: ThemeMode;
  isSlowMotion?: boolean;
  isPlaying?: boolean;
  showTelemetry?: boolean;
  className?: string;
  onRepComplete?: (reps: number) => void;
}

export const AnimatedExerciseCanvas: React.FC<AnimatedExerciseCanvasProps> = ({
  exercise,
  theme = 'dark',
  isSlowMotion = false,
  isPlaying = true,
  showTelemetry = true,
  className = '',
  onRepComplete,
}) => {
  const [cycleProgress, setCycleProgress] = useState<number>(0); // 0 to 1
  const [repCount, setRepCount] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const repCountRef = useRef<number>(0);

  // Determine cycle duration in seconds: slow-mo is 4.5s, normal is 2.8s
  const cycleDurationMs = (isSlowMotion ? 4.5 : 2.6) * 1000;

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setCycleProgress((prev) => {
        const next = prev + delta / cycleDurationMs;
        if (next >= 1) {
          repCountRef.current += 1;
          setRepCount(repCountRef.current);
          if (onRepComplete) onRepComplete(repCountRef.current);
          return next % 1;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isSlowMotion, cycleDurationMs, onRepComplete]);

  // Phase computation:
  let phaseName = 'Eccentric (Lowering)';
  let motionPos = 0; // 0 = top/start, 1 = bottom/max stretch
  let muscleTension = 0.4;

  if (cycleProgress < 0.5) {
    phaseName = 'Eccentric (Lowering)';
    motionPos = cycleProgress / 0.5; // 0 to 1
    muscleTension = 0.3 + motionPos * 0.4;
  } else if (cycleProgress < 0.6) {
    phaseName = 'Pause (Peak Tension)';
    motionPos = 1;
    muscleTension = 0.85;
  } else {
    phaseName = 'Concentric (Explode)';
    const concProgress = (cycleProgress - 0.6) / 0.4; // 0 to 1
    motionPos = 1 - concProgress; // 1 to 0
    muscleTension = 1.0 - concProgress * 0.4;
  }

  // Smooth sinusoidal easing for realistic anatomical bar path
  const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
  const easedPos = easeInOutSine(motionPos);

  const key = exercise.animationKey || 'bench_press';

  // Render specific animated skeletal / barbell motion per exercise category
  const renderExerciseMotion = () => {
    switch (key) {
      case 'squat':
      case 'leg_press': {
        // Squat: Hips go down from y: 80 to 125, knees bend forward from x: 100 to 80
        const hipY = 85 + easedPos * 42;
        const kneeY = 110 + easedPos * 18;
        const kneeX = 85 - easedPos * 12;
        const torsoAngle = easedPos * 18; // torso leans forward
        const barY = 55 + easedPos * 44;

        return (
          <g transform="translate(10, 0)">
            {/* Guide Bar Path Trajectory (dotted) */}
            <line x1="100" y1="55" x2="100" y2="100" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
            
            {/* Floor */}
            <line x1="40" y1="180" x2="160" y2="180" stroke="#3F3F46" strokeWidth="3" strokeLinecap="round" />

            {/* Feet */}
            <path d="M 70 180 L 85 180" stroke="#71717A" strokeWidth="6" strokeLinecap="round" />
            <path d="M 115 180 L 130 180" stroke="#71717A" strokeWidth="6" strokeLinecap="round" />

            {/* Lower Legs (Shin) */}
            <line x1="78" y1="180" x2={kneeX} y2={kneeY} stroke="#A1A1AA" strokeWidth="5" strokeLinecap="round" />
            <line x1="122" y1="180" x2={kneeX + 38} y2={kneeY} stroke="#A1A1AA" strokeWidth="5" strokeLinecap="round" />

            {/* Quads / Thighs (highlighted muscle in green) */}
            <line
              x1={kneeX}
              y1={kneeY}
              x2="100"
              y2={hipY}
              stroke="#10B981"
              strokeWidth={6 + muscleTension * 3}
              strokeLinecap="round"
              style={{ filter: muscleTension > 0.7 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.85))' : 'none' }}
            />

            {/* Torso & Head */}
            <line x1="100" y1={hipY} x2={100 - torsoAngle * 0.6} y2={barY + 12} stroke="#E4E4E7" strokeWidth="7" strokeLinecap="round" />
            <circle cx={100 - torsoAngle * 0.8} cy={barY - 8} r="9" fill="#F4F4F5" />

            {/* Arms holding Bar */}
            <path d={`M 100 ${barY + 12} L 100 ${barY} L 100 ${barY}`} stroke="#A1A1AA" strokeWidth="4" strokeLinecap="round" />

            {/* Olympic Barbell */}
            <line x1="50" y1={barY} x2="150" y2={barY} stroke="#D4D4D8" strokeWidth="3.5" />
            {/* Barbell Plates */}
            <rect x="42" y={barY - 14} width="8" height="28" rx="2" fill="#10B981" />
            <rect x="150" y={barY - 14} width="8" height="28" rx="2" fill="#10B981" />
            <rect x="36" y={barY - 10} width="6" height="20" rx="1" fill="#059669" />
            <rect x="158" y={barY - 10} width="6" height="20" rx="1" fill="#059669" />
          </g>
        );
      }

      case 'deadlift':
      case 'rdl':
      case 'hip_thrust': {
        const barY = 105 + easedPos * 58;
        const hipX = 105 - easedPos * 25;
        const hipY = 110 + easedPos * 12;
        const shoulderX = 102 + easedPos * 12;
        const shoulderY = 70 + easedPos * 38;

        return (
          <g transform="translate(10, 0)">
            {/* Floor */}
            <line x1="30" y1="180" x2="170" y2="180" stroke="#3F3F46" strokeWidth="3" strokeLinecap="round" />

            {/* Shins (vertical) */}
            <line x1="100" y1="180" x2={96 - easedPos * 4} y2="135" stroke="#A1A1AA" strokeWidth="5" strokeLinecap="round" />

            {/* Hamstrings & Glutes (active tension highlight) */}
            <line
              x1={96 - easedPos * 4}
              y1="135"
              x2={hipX}
              y2={hipY}
              stroke="#10B981"
              strokeWidth={6 + muscleTension * 3}
              strokeLinecap="round"
              style={{ filter: muscleTension > 0.7 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.85))' : 'none' }}
            />

            {/* Spine & Back (lat tension) */}
            <line
              x1={hipX}
              y1={hipY}
              x2={shoulderX}
              y2={shoulderY}
              stroke="#E4E4E7"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Head */}
            <circle cx={shoulderX + 6} cy={shoulderY - 12} r="8" fill="#F4F4F5" />

            {/* Arms hanging to Barbell */}
            <line x1={shoulderX} y1={shoulderY} x2="108" y2={barY} stroke="#71717A" strokeWidth="4" strokeLinecap="round" />

            {/* Barbell & Plates */}
            <line x1="60" y1={barY} x2="155" y2={barY} stroke="#D4D4D8" strokeWidth="3.5" />
            <circle cx="68" cy={barY} r="16" fill="#10B981" stroke="#059669" strokeWidth="2" />
            <circle cx="147" cy={barY} r="16" fill="#10B981" stroke="#059669" strokeWidth="2" />
            <circle cx="68" cy={barY} r="6" fill="#18181B" />
            <circle cx="147" cy={barY} r="6" fill="#18181B" />
          </g>
        );
      }

      case 'shoulder_press':
      case 'lateral_raise': {
        const barY = 85 - (1 - easedPos) * 50;
        const elbowX = 75 - (1 - easedPos) * 10;
        const elbowY = 92 - (1 - easedPos) * 35;

        return (
          <g transform="translate(10, 0)">
            {/* Seated Bench / Platform */}
            <rect x="80" y="125" width="40" height="55" rx="3" fill="#18181B" stroke="#3F3F46" />

            {/* Torso */}
            <line x1="100" y1="125" x2="100" y2="82" stroke="#E4E4E7" strokeWidth="8" strokeLinecap="round" />
            <circle cx="100" cy="65" r="9" fill="#F4F4F5" />

            {/* Deltoids (Shoulders) - glowing green */}
            <circle
              cx="86"
              cy="80"
              r={6 + muscleTension * 2}
              fill="#10B981"
              style={{ filter: muscleTension > 0.7 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.9))' : 'none' }}
            />
            <circle
              cx="114"
              cy="80"
              r={6 + muscleTension * 2}
              fill="#10B981"
              style={{ filter: muscleTension > 0.7 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.9))' : 'none' }}
            />

            {/* Arms (Upper Arm & Forearm) */}
            <line x1="86" y1="80" x2={elbowX} y2={elbowY} stroke="#A1A1AA" strokeWidth="4.5" strokeLinecap="round" />
            <line x1={elbowX} y1={elbowY} x2="88" y2={barY} stroke="#A1A1AA" strokeWidth="4" strokeLinecap="round" />

            <line x1="114" y1="80" x2={200 - elbowX} y2={elbowY} stroke="#A1A1AA" strokeWidth="4.5" strokeLinecap="round" />
            <line x1={200 - elbowX} y1={elbowY} x2="112" y2={barY} stroke="#A1A1AA" strokeWidth="4" strokeLinecap="round" />

            {/* Barbell */}
            <line x1="50" y1={barY} x2="150" y2={barY} stroke="#D4D4D8" strokeWidth="3.5" />
            <rect x="42" y={barY - 12} width="8" height="24" rx="2" fill="#10B981" />
            <rect x="150" y={barY - 12} width="8" height="24" rx="2" fill="#10B981" />
          </g>
        );
      }

      case 'lat_pulldown':
      case 'barbell_row': {
        const barY = 40 + (1 - easedPos) * 48;
        const latWidth = 14 + (1 - easedPos) * 10;

        return (
          <g transform="translate(10, 0)">
            {/* Cable Machine Pulley top */}
            <line x1="100" y1="15" x2="100" y2={barY - 6} stroke="#52525B" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="100" cy="15" r="5" fill="#10B981" />

            {/* Seated Thigh Pad & Bench */}
            <rect x="75" y="145" width="50" height="35" rx="3" fill="#18181B" stroke="#3F3F46" />
            <line x1="85" y1="140" x2="115" y2="140" stroke="#71717A" strokeWidth="4" />

            {/* Torso & Head */}
            <line x1="100" y1="145" x2="100" y2="85" stroke="#E4E4E7" strokeWidth="7" strokeLinecap="round" />
            <circle cx="100" cy="72" r="9" fill="#F4F4F5" />

            {/* Latissimus Dorsi (Lats) flare in green */}
            <path
              d={`M 92 88 Q ${100 - latWidth} 110 94 135 L 106 135 Q ${100 + latWidth} 110 108 88 Z`}
              fill="#10B981"
              opacity={0.3 + muscleTension * 0.7}
              style={{ filter: muscleTension > 0.7 ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.9))' : 'none' }}
            />

            {/* Arms reaching to Pulldown Bar */}
            <line x1="90" y1="84" x2="68" y2={barY + 6} stroke="#A1A1AA" strokeWidth="4" strokeLinecap="round" />
            <line x1="110" y1="84" x2="132" y2={barY + 6} stroke="#A1A1AA" strokeWidth="4" strokeLinecap="round" />

            {/* Wide Lat Pulldown Bar */}
            <path d={`M 50 ${barY + 10} Q 100 ${barY - 4} 150 ${barY + 10}`} stroke="#E4E4E7" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      }

      case 'bicep_curl': {
        const angleRad = (easedPos * 110 * Math.PI) / 180;
        const forearmLen = 42;
        const handX = 100 - Math.sin(angleRad) * forearmLen;
        const handY = 145 - (1 - Math.cos(angleRad)) * forearmLen;

        return (
          <g transform="translate(10, 0)">
            {/* Lifter Body */}
            <line x1="100" y1="170" x2="100" y2="70" stroke="#E4E4E7" strokeWidth="7" strokeLinecap="round" />
            <circle cx="100" cy="55" r="9" fill="#F4F4F5" />

            {/* Upper Arm */}
            <line x1="100" y1="75" x2="100" y2="108" stroke="#A1A1AA" strokeWidth="5" strokeLinecap="round" />

            {/* Bicep Peak Muscle (contracts and bulges in green) */}
            <ellipse
              cx="97"
              cy="92"
              rx={4 + (1 - easedPos) * 4}
              ry={7 + (1 - easedPos) * 2}
              fill="#10B981"
              style={{ filter: (1 - easedPos) > 0.6 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.9))' : 'none' }}
            />

            {/* Forearm */}
            <line x1="100" y1="108" x2={handX} y2={handY} stroke="#D4D4D8" strokeWidth="4" strokeLinecap="round" />

            {/* Dumbbell in hand */}
            <circle cx={handX} cy={handY} r="7" fill="#10B981" stroke="#059669" strokeWidth="2" />
            <line x1={handX - 5} y1={handY - 6} x2={handX - 5} y2={handY + 6} stroke="#A1A1AA" strokeWidth="3" />
            <line x1={handX + 5} y1={handY - 6} x2={handX + 5} y2={handY + 6} stroke="#A1A1AA" strokeWidth="3" />
          </g>
        );
      }

      case 'tricep_pushdown': {
        const handY = 95 + (1 - easedPos) * 55;

        return (
          <g transform="translate(10, 0)">
            {/* Cable Pulley */}
            <line x1="110" y1="20" x2="110" y2={handY} stroke="#52525B" strokeWidth="2" strokeDasharray="3,2" />
            <circle cx="110" cy="20" r="5" fill="#10B981" />

            {/* Lifter Body */}
            <line x1="90" y1="170" x2="95" y2="70" stroke="#E4E4E7" strokeWidth="7" strokeLinecap="round" />
            <circle cx="95" cy="55" r="9" fill="#F4F4F5" />

            {/* Upper Arm */}
            <line x1="95" y1="75" x2="98" y2="105" stroke="#A1A1AA" strokeWidth="5" strokeLinecap="round" />

            {/* Triceps Horseshoe (glows in green upon extension) */}
            <ellipse
              cx="92"
              cy="88"
              rx="4"
              ry={6 + (1 - easedPos) * 4}
              fill="#10B981"
              style={{ filter: (1 - easedPos) > 0.7 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.9))' : 'none' }}
            />

            {/* Forearm driving down */}
            <line x1="98" y1="105" x2="110" y2={handY} stroke="#D4D4D8" strokeWidth="4" strokeLinecap="round" />

            {/* Rope attachment handles */}
            <line x1="105" y1={handY} x2="115" y2={handY} stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      }

      case 'bench_press':
      case 'incline_dumbbell':
      default: {
        const barY = 65 + easedPos * 44;
        const elbowY = 85 + easedPos * 25;
        const elbowX = 65 - easedPos * 12;

        return (
          <g transform="translate(10, 0)">
            {/* Flat Gym Bench */}
            <line x1="40" y1="140" x2="160" y2="140" stroke="#27272A" strokeWidth="8" strokeLinecap="round" />
            <line x1="50" y1="140" x2="50" y2="180" stroke="#3F3F46" strokeWidth="4" />
            <line x1="150" y1="140" x2="150" y2="180" stroke="#3F3F46" strokeWidth="4" />

            {/* Lifter Torso lying on bench */}
            <path d="M 60 134 L 140 134" stroke="#E4E4E7" strokeWidth="12" strokeLinecap="round" />
            <circle cx="145" cy="132" r="9" fill="#F4F4F5" />

            {/* Pectoralis Major (Chest muscle) - Glowing green highlight upon pressing */}
            <ellipse
              cx="105"
              cy="128"
              rx={12 + muscleTension * 3}
              ry="7"
              fill="#10B981"
              opacity={0.3 + muscleTension * 0.7}
              style={{ filter: muscleTension > 0.7 ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.9))' : 'none' }}
            />

            {/* Arms (Upper Arm & Forearm) */}
            <line x1="120" y1="130" x2={elbowX + 35} y2={elbowY} stroke="#A1A1AA" strokeWidth="4.5" strokeLinecap="round" />
            <line x1={elbowX + 35} y1={elbowY} x2="105" y2={barY} stroke="#A1A1AA" strokeWidth="4.5" strokeLinecap="round" />

            {/* Vertical Bar Path Guide */}
            <line x1="105" y1="65" x2="105" y2="110" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />

            {/* Olympic Barbell */}
            <line x1="55" y1={barY} x2="155" y2={barY} stroke="#D4D4D8" strokeWidth="3.5" />
            {/* Plates */}
            <rect x="47" y={barY - 14} width="8" height="28" rx="2" fill="#10B981" />
            <rect x="155" y={barY - 14} width="8" height="28" rx="2" fill="#10B981" />
            <rect x="41" y={barY - 10} width="6" height="20" rx="1" fill="#059669" />
            <rect x="163" y={barY - 10} width="6" height="20" rx="1" fill="#059669" />
          </g>
        );
      }
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none ${className}`}>
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #1f2923 1px, transparent 1px), linear-gradient(to bottom, #1f2923 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Primary SVG Animation Canvas */}
      <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {renderExerciseMotion()}
        </svg>
      </div>

      {/* Real-Time Telemetry HUD Overlays */}
      {showTelemetry && (
        <>
          {/* Top Telemetry Pills */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-black/90 border border-emerald-500/50 text-emerald-400 font-mono text-[9px] font-extrabold flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              ANIMATED LOOP
            </span>

            <div className="flex items-center gap-1.5">
              {isSlowMotion && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-mono text-[8px] font-black uppercase">
                  0.5x SLOW
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[9px] font-bold">
                REP {repCount + 1}
              </span>
            </div>
          </div>

          {/* Bottom Cadence Phase Indicator Strip */}
          <div className="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur-none border border-zinc-800 px-2.5 py-1.5 rounded-xl flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-[10px] font-bold text-white tracking-wide uppercase">
                {phaseName}
              </span>
            </div>
            <span className="font-mono text-[9px] font-bold text-emerald-400">
              {Math.round(cycleProgress * 100)}% ROM
            </span>
          </div>
        </>
      )}
    </div>
  );
};
