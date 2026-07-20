import { useMemo, useRef, useEffect } from 'react';
import { toISO, fromISO, addDays, daysBetween, MON, todayISO } from '../lib/payruns';

/**
 * The lag: work on the top row, money on the bottom, a tie between them.
 * The gap is the point — you did the work weeks before you got paid for it.
 */
export default function LagStrip({ shifts, runs, today = todayISO() }) {
  const scroller = useRef(null);

  const PPD = 15;      // pixels per day
  const H = 200;
  const TOP = 46;
  const ROWH = 52;
  const PAY = 148;

  const dated = useMemo(() => runs.filter((r) => r.payday), [runs]);

  const m = useMemo(() => {
    const stamps = [...shifts.map((s) => s.date), ...dated.map((r) => r.payday), today]
      .filter(Boolean)
      .sort();
    if (!stamps.length) return null;
    const min = addDays(fromISO(stamps[0]), -3);
    const max = addDays(fromISO(stamps[stamps.length - 1]), 3);
    const days = Math.max(14, daysBetween(toISO(min), toISO(max)));
    return {
      min,
      days,
      width: days * PPD,
      x: (iso) => daysBetween(toISO(min), iso) * PPD + PPD / 2,
      maxHours: Math.max(...shifts.map((s) => Number(s.hours) || 0), 8),
      maxAmount: Math.max(...dated.map((r) => r.amount), 1),
    };
  }, [shifts, dated, today]);

  useEffect(() => {
    if (scroller.current && m) scroller.current.scrollLeft = Math.max(0, m.x(today) - 130);
  }, [m, today]);

  if (!m) return null;

  const colourFor = (status) =>
    status === 'landed' ? 'var(--zc-banked)'
      : status === 'incoming' ? 'var(--zc-ink)'
        : status === 'nodate' ? 'var(--zc-ink-40)'
          : 'var(--zc-due)';

  const runOf = (shift) => runs.find((r) => r.shifts.some((z) => z.id === shift.id));

  const sprockets = [];
  for (let i = 0; i * 22 < m.width; i++) sprockets.push(i * 22 + 11);

  return (
    <div className="zc-lag" ref={scroller}>
      <svg
        width={m.width}
        height={H}
        style={{ display: 'block' }}
        role="img"
        aria-label={`Timeline of ${shifts.length} shifts and the ${dated.length} pay runs they land in`}
      >
        {/* fanfold edge */}
        {sprockets.map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={9} r={3} fill="none" stroke="var(--zc-rule)" />
            <circle cx={cx} cy={H - 9} r={3} fill="none" stroke="var(--zc-rule)" />
          </g>
        ))}
        <line x1="0" y1="20" x2={m.width} y2="20" stroke="var(--zc-rule)" />
        <line x1="0" y1={H - 20} x2={m.width} y2={H - 20} stroke="var(--zc-rule)" />

        {/* week gridlines */}
        {Array.from({ length: m.days }).map((_, i) => {
          const d = addDays(m.min, i);
          if (d.getDay() !== 1) return null;
          const cx = i * PPD + PPD / 2;
          return (
            <g key={i}>
              <line x1={cx} y1="24" x2={cx} y2={H - 24} stroke="var(--zc-rule)" opacity=".55" />
              <text x={cx + 4} y="34" fontFamily="var(--zc-mono)" fontSize="8.5" fill="var(--zc-ink-40)">
                {d.getDate()} {MON[d.getMonth()].toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* now */}
        <line x1={m.x(today)} y1="24" x2={m.x(today)} y2={H - 24} stroke="var(--zc-ink)" strokeWidth="1.5" strokeDasharray="2 3" />
        <text x={m.x(today) + 4} y={H - 27} fontFamily="var(--zc-mono)" fontSize="8.5" fontWeight="700" fill="var(--zc-ink)" letterSpacing=".1em">
          NOW
        </text>

        {/* work → money */}
        {shifts.map((s) => {
          const run = runOf(s);
          if (!run || !run.payday) return null;
          const x1 = m.x(s.date);
          const x2 = m.x(run.payday);
          const y1 = TOP + ROWH;
          const y2 = PAY;
          return (
            <path
              key={s.id}
              className="zc-tie"
              d={`M${x1},${y1} C${x1},${y1 + 28} ${x2},${y2 - 32} ${x2},${y2}`}
              fill="none"
              stroke={colourFor(run.status)}
              strokeWidth="1"
              opacity=".38"
              strokeDasharray="200"
              strokeDashoffset="200"
              style={{ animationDelay: `${Math.min(600, Math.max(0, daysBetween(toISO(m.min), s.date)) * 12)}ms` }}
            />
          );
        })}

        {/* shifts */}
        {shifts.map((s) => {
          const run = runOf(s);
          const h = Math.max(6, ((Number(s.hours) || 0) / m.maxHours) * (ROWH - 6));
          const future = s.date > today;
          const c = colourFor(run?.status ?? 'nodate');
          return (
            <g key={s.id}>
              <rect
                x={m.x(s.date) - 4}
                y={TOP + ROWH - h}
                width="8"
                height={h}
                rx="1.5"
                fill={future ? 'none' : c}
                stroke={c}
                strokeDasharray={future ? '2 2' : 'none'}
              />
              {/* no payday: a stub going nowhere */}
              {!run?.payday && (
                <line
                  x1={m.x(s.date)} y1={TOP + ROWH}
                  x2={m.x(s.date)} y2={TOP + ROWH + 14}
                  stroke="var(--zc-ink-40)" strokeWidth="1" strokeDasharray="2 2"
                />
              )}
            </g>
          );
        })}
        <text x="4" y={TOP - 4} fontFamily="var(--zc-mono)" fontSize="8" fill="var(--zc-ink-40)" letterSpacing=".12em">
          SHIFTS
        </text>

        {/* pay runs */}
        {dated.map((r) => (
          <g key={r.key}>
            <circle
              cx={m.x(r.payday)}
              cy={PAY}
              r={5 + (r.amount / m.maxAmount) * 7}
              fill={r.status === 'landed' ? colourFor(r.status) : 'var(--zc-paper)'}
              stroke={colourFor(r.status)}
              strokeWidth="1.75"
            />
            <text
              x={m.x(r.payday)} y={PAY + 26}
              textAnchor="middle"
              fontFamily="var(--zc-mono)" fontSize="8.5" fontWeight="700"
              fill={colourFor(r.status)}
            >
              {Math.round(r.amount)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
