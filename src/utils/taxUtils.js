// UK Income Tax + National Insurance estimator
// Based on 2025/26 and 2026/27 rates (unchanged between the two years)
// This is an ESTIMATE only. Actual tax depends on your tax code,
// other income sources, pension contributions, student loan plan,
// and other factors this app cannot know about.

// -- England, Wales, Northern Ireland --
const EW_BANDS = [
  { limit: 12570, rate: 0 },       // Personal allowance
  { limit: 50270, rate: 0.20 },    // Basic rate
  { limit: 125140, rate: 0.40 },   // Higher rate
  { limit: Infinity, rate: 0.45 }, // Additional rate
];

// -- Scotland --
const SCOTLAND_BANDS = [
  { limit: 12570, rate: 0 },       // Personal allowance
  { limit: 14876, rate: 0.19 },    // Starter rate
  { limit: 26561, rate: 0.20 },    // Basic rate
  { limit: 43662, rate: 0.21 },    // Intermediate rate
  { limit: 75000, rate: 0.42 },    // Higher rate
  { limit: 125140, rate: 0.45 },   // Advanced rate
  { limit: Infinity, rate: 0.48 }, // Top rate
];

// -- National Insurance (Class 1 Employee) --
// Primary Threshold: GBP 12,570 / year (GBP 242/week)
// Upper Earnings Limit: GBP 50,270 / year (GBP 967/week)
const NI_LOWER = 12570;
const NI_UPPER = 50270;
const NI_MAIN_RATE = 0.08;   // 8% between PT and UEL
const NI_UPPER_RATE = 0.02;  // 2% above UEL

function calcIncomeTax(annualIncome, region) {
  const bands = region === "scotland" ? SCOTLAND_BANDS : EW_BANDS;
  let tax = 0;
  let prev = 0;
  for (const band of bands) {
    if (annualIncome <= prev) break;
    const taxable = Math.min(annualIncome, band.limit) - prev;
    tax += taxable * band.rate;
    prev = band.limit;
  }
  return Math.max(0, tax);
}

function calcNI(annualIncome) {
  let ni = 0;
  if (annualIncome > NI_LOWER) {
    ni += Math.min(annualIncome, NI_UPPER - NI_LOWER) * NI_MAIN_RATE;
    // only apply upper rate to income above NI_UPPER
    if (annualIncome > NI_UPPER) {
      ni += (annualIncome - NI_UPPER) * NI_UPPER_RATE;
    }
  }
  return Math.max(0, ni);
}

/**
 * Given the user's annual earnings from this app, plus any other annual income,
 * returns a breakdown of estimated tax and take-home pay.
 *
 * @param {number} appEarnings     - total annual earnings from Zero Contract shifts
 * @param {number} otherIncome     - other annual income declared by user (default 0)
 * @param {string} region          - "rest_of_uk" | "scotland" | "skip"
 * @returns {object}
 */
export function estimateTax(appEarnings, otherIncome = 0, region = "rest_of_uk") {
  if (region === "skip") return null; // user hasn't set region yet

  const totalIncome = appEarnings + otherIncome;

  const totalIncomeTax = calcIncomeTax(totalIncome, region);
  const totalNI = calcNI(totalIncome);

  // Attribute the tax proportionally to this app's share of total income
  const proportion = totalIncome > 0 ? appEarnings / totalIncome : 1;
  const attributedIncomeTax = totalIncomeTax * proportion;
  const attributedNI = totalNI * proportion;

  const totalDeductions = attributedIncomeTax + attributedNI;
  const takeHome = appEarnings - totalDeductions;
  const effectiveRate = appEarnings > 0 ? totalDeductions / appEarnings : 0;

  return {
    grossEarnings: appEarnings,
    estimatedIncomeTax: attributedIncomeTax,
    estimatedNI: attributedNI,
    totalDeductions,
    estimatedTakeHome: takeHome,
    effectiveRate,
    region,
    // Marginal rate (what the next pound earned will cost)
    marginalIncomeTaxRate: getMarginalRate(totalIncome, region),
    marginalNIRate: getMarginalNIRate(totalIncome),
  };
}

function getMarginalRate(income, region) {
  const bands = region === "scotland" ? SCOTLAND_BANDS : EW_BANDS;
  for (let i = 0; i < bands.length; i++) {
    if (income < bands[i].limit) return bands[i].rate;
  }
  return bands[bands.length - 1].rate;
}

function getMarginalNIRate(income) {
  if (income < NI_LOWER) return 0;
  if (income <= NI_UPPER) return NI_MAIN_RATE;
  return NI_UPPER_RATE;
}