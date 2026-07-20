/* ==========================================================================
   Zero Contract — turning rows in `shifts` into pay runs
   --------------------------------------------------------------------------
   Your schema stores rate and payday per shift, with a `paid` boolean each.
   A "pay run" is just every shift sharing a payday. Shifts with payday = null
   are money with no date attached, which is its own problem — we surface them
   rather than hide them.
   ========================================================================== */

export const NO_DATE = '__nodate';

/* ---- dates -------------------------------------------------------------- */
const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const daysBetween = (a, b) => Math.round((fromISO(b) - fromISO(a)) / 86400000);

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const niceDate = (iso) => {
  const d = fromISO(iso);
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
};

/** London-local today, matching what send-reminders uses. */
export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export const gbp = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);

/* ---- shift maths -------------------------------------------------------- */
/** Gross for one shift row. `hours` is stored, so trust it over the clock times. */
export const grossOf = (shift) => (Number(shift.hours) || 0) * (Number(shift.rate) || 0);

/** Hours from start_time/end_time — only used to spot rows where `hours` looks wrong. */
export function clockHours(shift) {
  if (!shift.start_time || !shift.end_time) return null;
  const m = (t) => { const [h, mm] = t.split(':').map(Number); return h * 60 + mm; };
  const raw = (m(shift.end_time) - m(shift.start_time) + 1440) % 1440;
  return raw / 60;
}

/**
 * Group shifts into pay runs.
 * @param {Array} shifts rows from public.shifts
 * @param {string} today ISO date
 */
export function buildPayRuns(shifts, today = todayISO()) {
  const map = new Map();

  for (const s of shifts) {
    const key = s.payday || NO_DATE;
    if (!map.has(key)) {
      map.set(key, { key, payday: s.payday || null, amount: 0, hours: 0, shifts: [] });
    }
    const run = map.get(key);
    run.amount += grossOf(s);
    run.hours += Number(s.hours) || 0;
    run.shifts.push(s);
  }

  const runs = [...map.values()].map((run) => {
    const allPaid = run.shifts.every((s) => s.paid === true);
    const somePaid = run.shifts.some((s) => s.paid === true);
    let status;
    if (!run.payday) status = 'nodate';
    else if (allPaid) status = 'landed';
    else if (run.payday > today) status = 'incoming';
    else if (run.payday === today) status = 'due';
    else status = 'late';

    return {
      ...run,
      amount: round2(run.amount),
      hours: round2(run.hours),
      status,
      allPaid,
      partlyPaid: somePaid && !allPaid,
      daysLate: run.payday && run.payday < today ? daysBetween(run.payday, today) : 0,
      daysAway: run.payday && run.payday > today ? daysBetween(today, run.payday) : 0,
    };
  });

  // No-date bucket sinks to the bottom; everything else runs chronologically.
  return runs.sort((a, b) => {
    if (!a.payday) return 1;
    if (!b.payday) return -1;
    return a.payday.localeCompare(b.payday);
  });
}

/** Headline numbers for the tiles. */
export function summarise(runs) {
  const t = { banked: 0, owed: 0, incoming: 0, undated: 0, bankedN: 0, owedN: 0, incomingN: 0, undatedN: 0 };
  for (const r of runs) {
    if (r.status === 'landed') { t.banked += r.amount; t.bankedN++; }
    else if (r.status === 'incoming') { t.incoming += r.amount; t.incomingN++; }
    else if (r.status === 'nodate') { t.undated += r.amount; t.undatedN++; }
    else { t.owed += r.amount; t.owedN++; }
  }
  return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, round2(v)]));
}

/** The run the hero should lead on: soonest one that hasn't landed. */
export function nextRun(runs) {
  return runs.find((r) => r.status !== 'landed' && r.payday) || null;
}

/** Gross earned in the current tax year, up to and including today. */
export function grossThisTaxYear(shifts, taxYearStartISO, today = todayISO()) {
  return round2(
    shifts
      .filter((s) => s.date >= taxYearStartISO && s.date <= today)
      .reduce((a, s) => a + grossOf(s), 0)
  );
}

/** Rows where stored `hours` disagrees with the clock by more than 6 minutes. */
export function suspectHours(shifts) {
  return shifts.filter((s) => {
    const c = clockHours(s);
    return c !== null && Math.abs(c - (Number(s.hours) || 0)) > 0.1;
  });
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
