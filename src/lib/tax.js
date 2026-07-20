/* ==========================================================================
   Zero Contract — tax estimator
   --------------------------------------------------------------------------
   Estimates only. Real PAYE runs on a cumulative, per-pay-period basis using
   your tax code, so a payslip will rarely match this to the penny — especially
   on zero hours, where lumpy income often means you overpay and are owed a
   refund. Treat these numbers as a sense-check against a payslip, not a
   replacement for one. This is not tax advice.

   Rates below are for the 2026/27 tax year (6 Apr 2026 – 5 Apr 2027).
   Sources:
     rUK bands / PA frozen to 2031 ....... commonslibrary.parliament.uk/research-briefings/cbp-10618/
     Scottish bands 2026-27 .............. gov.scot/news/income-tax-proposals-for-2026-27-3/
     Employee NI 8% / 2% ................. commonslibrary.parliament.uk/research-briefings/cbp-10618/

   UPDATE ME EVERY APRIL. Add the new year as a key in TAX_YEARS and the app
   picks it up automatically via taxYearOf().
   ========================================================================== */

export const TAX_YEARS = {
  '2026-27': {
    startsOn: '2026-04-06',
    endsOn: '2027-04-05',
    personalAllowance: 12570,
    // PA tapers by £1 for every £2 earned over this, gone by £125,140
    taperFrom: 100000,
    regions: {
      // England, Wales, Northern Ireland
      rest_of_uk: {
        label: 'England, Wales or NI',
        // `to` is total income (not income above the allowance)
        bands: [
          { to: 50270, rate: 0.20, name: 'Basic' },
          { to: 125140, rate: 0.40, name: 'Higher' },
          { to: Infinity, rate: 0.45, name: 'Additional' },
        ],
      },
      scotland: {
        label: 'Scotland',
        bands: [
          { to: 16537, rate: 0.19, name: 'Starter' },
          { to: 29526, rate: 0.20, name: 'Basic' },
          { to: 43662, rate: 0.21, name: 'Intermediate' },
          { to: 75000, rate: 0.42, name: 'Higher' },
          { to: 125140, rate: 0.45, name: 'Advanced' },
          { to: Infinity, rate: 0.48, name: 'Top' },
        ],
      },
    },
    // Class 1 employee NI — same across the whole UK, Scotland included
    ni: {
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      mainRate: 0.08,
      upperRate: 0.02,
    },
  },
};

export const DEFAULT_TAX_YEAR = '2026-27';

/** Which tax year does an ISO date (YYYY-MM-DD) fall in? */
export function taxYearOf(isoDate) {
  const found = Object.entries(TAX_YEARS).find(
    ([, y]) => isoDate >= y.startsOn && isoDate <= y.endsOn
  );
  return found ? found[0] : DEFAULT_TAX_YEAR;
}

/** First day of the tax year containing `isoDate`. */
export function taxYearStart(isoDate) {
  return TAX_YEARS[taxYearOf(isoDate)].startsOn;
}

/** Personal allowance after the £100k taper. */
function allowanceFor(income, cfg) {
  if (income <= cfg.taperFrom) return cfg.personalAllowance;
  const lost = Math.floor((income - cfg.taperFrom) / 2);
  return Math.max(0, cfg.personalAllowance - lost);
}

/**
 * Income tax on an annual income.
 * @param {number} income   annual gross
 * @param {'scotland'|'rest_of_uk'} region
 * @param {string} year     key of TAX_YEARS
 * @returns {{ total: number, breakdown: Array<{name,rate,amount,tax}> }}
 */
export function incomeTax(income, region = 'rest_of_uk', year = DEFAULT_TAX_YEAR) {
  const cfg = TAX_YEARS[year];
  const bands = (cfg.regions[region] ?? cfg.regions.rest_of_uk).bands;
  const allowance = allowanceFor(income, cfg);

  let total = 0;
  const breakdown = [];
  // Walk the bands. `floor` is where the current band starts, in total-income terms.
  let floor = allowance;

  for (const band of bands) {
    if (income <= floor) break;
    const top = Math.min(income, Math.max(band.to, allowance));
    const amount = Math.max(0, top - floor);
    if (amount > 0) {
      const tax = amount * band.rate;
      total += tax;
      breakdown.push({ name: band.name, rate: band.rate, amount, tax });
    }
    floor = Math.max(floor, band.to);
    if (!Number.isFinite(band.to)) break;
  }
  return { total: round2(total), breakdown };
}

/** Class 1 employee National Insurance on an annual income. */
export function nationalInsurance(income, year = DEFAULT_TAX_YEAR) {
  const { primaryThreshold: pt, upperEarningsLimit: uel, mainRate, upperRate } =
    TAX_YEARS[year].ni;
  if (income <= pt) return 0;
  const main = Math.min(income, uel) - pt;
  const upper = Math.max(0, income - uel);
  return round2(main * mainRate + upper * upperRate);
}

/**
 * Full estimate for an annual income.
 * @param {object} args
 * @param {number} args.gross        annual gross from shifts
 * @param {number} [args.otherIncome] profiles.other_income
 * @param {'scotland'|'rest_of_uk'} [args.region] profiles.tax_region
 * @param {string} [args.year]
 */
export function estimate({ gross, otherIncome = 0, region = 'rest_of_uk', year = DEFAULT_TAX_YEAR }) {
  const total = Math.max(0, (gross || 0) + (otherIncome || 0));
  const tax = incomeTax(total, region, year);
  const ni = nationalInsurance(total, year);
  const deductions = round2(tax.total + ni);
  return {
    year,
    region,
    gross: round2(gross || 0),
    otherIncome: round2(otherIncome || 0),
    totalIncome: round2(total),
    incomeTax: tax.total,
    nationalInsurance: ni,
    deductions,
    takeHome: round2(total - deductions),
    // Share of every £1 that survives. Use this to apportion a single pay run.
    keepRate: total > 0 ? (total - deductions) / total : 1,
    breakdown: tax.breakdown,
  };
}

/**
 * Apportion an estimate to one pay run.
 * Deliberately naive: applies the year-to-date effective rate, so it reads as
 * "roughly what you keep", not a PAYE prediction.
 */
export function applyKeepRate(amount, keepRate) {
  return round2(amount * keepRate);
}

/** Normalise whatever is in profiles.tax_region into a key we know. */
export function normaliseRegion(value) {
  const v = (value || '').toLowerCase().trim();
  if (v === 'scotland' || v === 'scottish' || v === 'sco') return 'scotland';
  return 'rest_of_uk';
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
