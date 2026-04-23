'use client';

import { useEffect, useMemo, useState } from 'react';

type Phase = 'base' | 'created' | 'completed' | 'deleting';

type SetRow = {
  id: number;
  reps: number;
  done: boolean;
};

const BASE_ROWS: SetRow[] = [
  { id: 1, reps: 12, done: false },
  { id: 2, reps: 12, done: false },
  { id: 3, reps: 12, done: false },
  { id: 4, reps: 12, done: false },
];

const CYCLE: Phase[] = ['base', 'created', 'completed', 'deleting'];

export default function SeriesReferenceAnimation() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = CYCLE[phaseIndex];

  useEffect(() => {
    const delay =
      phase === 'base' ? 900 : phase === 'created' ? 1100 : phase === 'completed' ? 1200 : 3600;

    const timer = window.setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % CYCLE.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [phase]);

  const rows = useMemo(() => {
    const withCreated =
      phase === 'created' || phase === 'completed' || phase === 'deleting';
    const list = withCreated
      ? [...BASE_ROWS, { id: 5, reps: 12, done: false }]
      : BASE_ROWS;

    if (phase === 'completed' || phase === 'deleting') {
      return list.map((row) =>
        row.id === 1 || row.id === 2 ? { ...row, done: true } : row
      );
    }

    return list;
  }, [phase]);

  const shouldPressAdd = phase === 'created';

  return (
    <div className="w-full max-w-[360px] rounded-[28px] border border-white/10 bg-[#0b0d10] p-3 shadow-[0_25px_45px_rgba(0,0,0,0.55)]">
      <div className="grid grid-cols-[1fr_1fr_56px] gap-3 px-2 pb-2 text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase">
        <span>Serie</span>
        <span>Reps</span>
        <span className="text-right"> </span>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const isBlue = row.done;
          const isNew = phase === 'created' && row.id === 5;
          const isDeletingRow = phase === 'deleting' && row.id === 3;

          return (
            <div
              key={row.id}
              className={`relative overflow-hidden rounded-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isDeletingRow ? 'animate-[deleteCollapse_2600ms_cubic-bezier(0.3,0,0.2,1)_forwards]' : ''
              }`}
            >
              {isDeletingRow ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-end bg-[#ff4f57] pr-9 text-white">
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                      <path
                        d="M9 4.5H15M4.5 7.5H19.5M8 7.5V18.5C8 19.3 8.7 20 9.5 20H14.5C15.3 20 16 19.3 16 18.5V7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-[1fr_1fr_56px] items-center gap-3 rounded-xl bg-[#111318] px-3 py-2 animate-[swipeDeleteReal_2600ms_cubic-bezier(0.2,0.75,0.2,1)_forwards]">
                    <span className="text-lg font-semibold text-zinc-200">{row.id}</span>
                    <div className="mx-auto flex h-12 w-[76px] items-center justify-center rounded-xl border border-white/10 bg-zinc-800 text-2xl font-bold text-zinc-200">
                      {row.reps}
                    </div>
                    <div className="ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-zinc-700 text-zinc-200">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                        <path
                          d="M5 12.5L10 17L19 7.5"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className={`grid grid-cols-[1fr_1fr_56px] items-center gap-3 rounded-xl px-3 py-2 transition-all duration-320 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isBlue ? 'bg-[#0a223a]' : 'bg-transparent'
                  } ${isNew ? 'animate-[setPop_420ms_cubic-bezier(0.22,1.2,0.36,1)]' : ''} ${
                    phase === 'completed' && isBlue ? 'animate-[completedFlash_460ms_ease-out]' : ''
                  }`}
                >
                  <span
                    className={`text-lg font-semibold transition-colors duration-320 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isBlue ? 'text-[#1f9cff]' : 'text-zinc-200'
                    }`}
                  >
                    {row.id}
                  </span>

                  <div
                    className={`mx-auto flex h-12 w-[76px] items-center justify-center rounded-xl border text-2xl font-bold transition-all duration-320 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isBlue
                        ? 'border-[#0d4b7a] bg-[#0e3a5f] text-[#1f9cff]'
                        : 'border-white/10 bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    {row.reps}
                  </div>

                  <div
                    className={`ml-auto flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-320 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isBlue
                        ? 'border-[#0d4b7a] bg-[#124a75] text-[#1f9cff]'
                        : 'border-white/10 bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                      <path
                        d="M5 12.5L10 17L19 7.5"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className={`mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 text-base font-semibold text-zinc-200 transition-all duration-200 ${
          shouldPressAdd ? 'animate-[addPress_260ms_cubic-bezier(0.34,1.56,0.64,1)]' : ''
        }`}
      >
        <span className="text-xl leading-none">+</span>
        Nueva Serie
      </button>

      <style jsx>{`
        @keyframes setPop {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.95);
          }
          70% {
            opacity: 1;
            transform: translateY(-2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes addPress {
          0% {
            transform: translateY(0) scale(1);
            filter: brightness(1);
          }
          45% {
            transform: translateY(1px) scale(0.965);
            filter: brightness(0.86);
          }
          100% {
            transform: translateY(0) scale(1);
            filter: brightness(1);
          }
        }

        @keyframes completedFlash {
          0% {
            box-shadow: inset 0 0 0 rgba(31, 156, 255, 0);
          }
          55% {
            box-shadow: inset 0 0 0 1px rgba(31, 156, 255, 0.55);
          }
          100% {
            box-shadow: inset 0 0 0 rgba(31, 156, 255, 0);
          }
        }

        @keyframes swipeDeleteReal {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          20% {
            transform: translateX(0);
            opacity: 1;
          }
          60% {
            transform: translateX(-45%);
            opacity: 1;
          }
          78% {
            transform: translateX(-45%);
            opacity: 1;
          }
          100% {
            transform: translateX(-56%);
            opacity: 0;
          }
        }

        @keyframes deleteCollapse {
          0% {
            max-height: 64px;
            margin-top: 0;
            opacity: 1;
          }
          76% {
            max-height: 64px;
            margin-top: 0;
            opacity: 1;
          }
          100% {
            max-height: 0;
            margin-top: -8px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
