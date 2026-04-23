'use client';

import { useEffect, useId, useMemo, useState } from 'react';

type DayPoint = {
  day: string;
  minutes: number;
  exercises: number;
};

const WEEK_DATA: DayPoint[] = [
  { day: 'Lun', minutes: 50, exercises: 6 },
  { day: 'Mar', minutes: 34, exercises: 4 },
  { day: 'Mie', minutes: 56, exercises: 7 },
  { day: 'Jue', minutes: 42, exercises: 5 },
  { day: 'Vie', minutes: 60, exercises: 8 },
  { day: 'Sab', minutes: 28, exercises: 3 },
  { day: 'Dom', minutes: 36, exercises: 4 },
];

function makePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

export default function ExerciseProgressChart() {
  const [replay, setReplay] = useState(0);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setReplay((prev) => prev + 1);
    }, 6400);

    return () => window.clearInterval(timer);
  }, []);

  const width = 336;
  const height = 200;
  const left = 30;
  const right = 16;
  const top = 16;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxMinutes = 60;
  const maxExercises = 8;
  const baseY = top + plotHeight;

  const { minutePoints, exercisePoints, minutePath, exercisePath, areaPath } = useMemo(() => {
    const minutePts = WEEK_DATA.map((item, index) => {
      const x = left + (index / (WEEK_DATA.length - 1)) * plotWidth;
      const y = top + plotHeight - (item.minutes / maxMinutes) * plotHeight;
      return { x, y };
    });

    const exercisePts = WEEK_DATA.map((item, index) => {
      const x = left + (index / (WEEK_DATA.length - 1)) * plotWidth;
      const y = top + plotHeight - (item.exercises / maxExercises) * plotHeight;
      return { x, y };
    });

    const minutesLine = makePath(minutePts);
    const exercisesLine = makePath(exercisePts);
    const area = `${minutesLine} L ${minutePts[minutePts.length - 1].x.toFixed(1)} ${baseY.toFixed(1)} L ${minutePts[0].x.toFixed(1)} ${baseY.toFixed(1)} Z`;

    return {
      minutePoints: minutePts,
      exercisePoints: exercisePts,
      minutePath: minutesLine,
      exercisePath: exercisesLine,
      areaPath: area,
    };
  }, [plotHeight, plotWidth, baseY]);

  const monday = WEEK_DATA[0];
  const clipId = `clip-${uid}-${replay}`;

  return (
    <div className="w-full max-w-[360px] rounded-3xl border border-white/10 bg-[#0b0d10] p-3 shadow-[0_25px_45px_rgba(0,0,0,0.55)]">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-zinc-100">Progreso Semanal</p>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
          Dias (tiempo) y ejercicios
        </span>
      </div>

      <svg
        key={replay}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible rounded-2xl bg-[#0f1318]"
        role="img"
        aria-label="Grafico semanal con tiempo y ejercicios realizados"
      >
        <defs>
          <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22a3ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22a3ff" stopOpacity="0.03" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={left} y={top} width={plotWidth} height={plotHeight + 10} className="chart-reveal" />
          </clipPath>
        </defs>

        <line x1={left} y1={top} x2={left} y2={baseY} stroke="#2d333d" strokeWidth="1.2" />
        <line x1={left} y1={baseY} x2={width - right} y2={baseY} stroke="#2d333d" strokeWidth="1.2" />
        <line x1={left} y1={top + plotHeight / 2} x2={width - right} y2={top + plotHeight / 2} stroke="#222831" strokeWidth="1" strokeDasharray="4 4" />

        <g clipPath={`url(#${clipId})`}>
          <path d={areaPath} fill={`url(#area-${uid})`} />

          <path
            d={minutePath}
            stroke="#22a3ff"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            className="line-draw-minutes"
            pathLength={1}
          />
          <path
            d={exercisePath}
            stroke="#f6c453"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            className="line-draw-exercises"
            pathLength={1}
          />

          {minutePoints.map((point, index) => (
            <circle
              key={`m-${index}`}
              cx={point.x}
              cy={point.y}
              r="3.8"
              fill="#22a3ff"
              className="point-pop"
              style={{ animationDelay: `${460 + index * 90}ms` }}
            />
          ))}
          {exercisePoints.map((point, index) => (
            <circle
              key={`e-${index}`}
              cx={point.x}
              cy={point.y}
              r="3.1"
              fill="#f6c453"
              className="point-pop"
              style={{ animationDelay: `${560 + index * 90}ms` }}
            />
          ))}
        </g>

        {WEEK_DATA.map((item, index) => {
          const x = left + (index / (WEEK_DATA.length - 1)) * plotWidth;
          return (
            <text key={item.day} x={x - 10} y={height - 10} fill="#848a96" fontSize="10" fontWeight="600">
              {item.day}
            </text>
          );
        })}

        <text x={left - 18} y={top + 10} fill="#7b818d" fontSize="10" fontWeight="600">
          8
        </text>
        <text x={left - 18} y={top + plotHeight / 2 + 4} fill="#7b818d" fontSize="10" fontWeight="600">
          4
        </text>
        <text x={left - 18} y={baseY} fill="#7b818d" fontSize="10" fontWeight="600">
          0
        </text>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 text-left">
        <div className="rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Lunes tiempo</p>
          <p className="text-xl font-bold text-zinc-100">{monday.minutes} min</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">Lunes ejercicios</p>
          <p className="text-xl font-bold text-zinc-100">{monday.exercises}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 px-1 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22a3ff]" /> Tiempo (min)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f6c453]" /> Ejercicios
        </span>
      </div>

      <style jsx>{`
        .chart-reveal {
          transform-origin: left center;
          transform-box: fill-box;
          animation: revealFill 1700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .line-draw-minutes,
        .line-draw-exercises {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }

        .line-draw-minutes {
          animation: drawLine 1700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .line-draw-exercises {
          animation: drawLine 1850ms cubic-bezier(0.22, 1, 0.36, 1) 120ms forwards;
        }

        .point-pop {
          opacity: 0;
          transform-origin: center;
          transform-box: fill-box;
          animation: pointPop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes revealFill {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pointPop {
          0% {
            transform: scale(0.2);
            opacity: 0;
          }
          70% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
