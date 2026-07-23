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

function calcIncomeTax(annualIncome, region, pa = 12570) {
  const base = region === "scotland" ? SCOTLAND_BANDS : EW_BANDS;
  // Swap the 0%-rate personal-allowance threshold for the code-derived one.
  const bands = base.map((b, i) => (i === 0 ? { ...b, limit: pa } : b));
  let tax = 0;
  let prev = 0;
  for (const band of bands) {
    if (annualIncome <= prev) break;
    const taxable = Math.min(annualIncome, band.limit) - prev;
    if (taxable > 0) tax += taxable * band.rate;
    prev = band.limit;
  }
  return Math.max(0, tax);
}

function calcNI(annualIncome) {
  let ni = 0;
  if (annualIncome > NI_LOWER) {
    ni += Math.min(annualIncome - NI_LOWER, NI_UPPER - NI_LOWER) * NI_MAIN_RATE;
    // only apply upper rate to income above NI_UPPER
    if (annualIncome > NI_UPPER) {
      ni += (annualIncome - NI_UPPER) * NI_UPPER_RATE;
    }
  }
  return Math.max(0, ni);
}

// Self-employed National Insurance (Class 4): 6% between the thresholds, 2% above.
const CLASS4_MAIN = 0.06;
const CLASS4_UPPER = 0.02;
function calcClass4NI(annualIncome) {
  let ni = 0;
  if (annualIncome > NI_LOWER) {
    ni += Math.min(annualIncome - NI_LOWER, NI_UPPER - NI_LOWER) * CLASS4_MAIN;
    if (annualIncome > NI_UPPER) ni += (annualIncome - NI_UPPER) * CLASS4_UPPER;
  }
  return Math.max(0, ni);
}

// Student loan repayment: a % of income above the plan's threshold.
const STUDENT_LOAN_PLANS = {
  plan1: { threshold: 24990, rate: 0.09 },
  plan2: { threshold: 27295, rate: 0.09 },
  plan4: { threshold: 31395, rate: 0.09 },
  plan5: { threshold: 25000, rate: 0.09 },
  postgrad: { threshold: 21000, rate: 0.06 },
};
function calcStudentLoan(plan, income) {
  const p = STUDENT_LOAN_PLANS[plan];
  if (!p) return 0;
  return Math.max(0, (income - p.threshold) * p.rate);
}

// Personal allowance / special handling from a PAYE tax code.
// Returns { special } for BR/D0/D1/NT, or { pa } (personal allowance in £).
function parseTaxCode(code) {
  const c = (code || "").toUpperCase().replace(/\s/g, "");
  if (!c) return { pa: 12570 };
  if (c === "NT") return { special: "NT" };
  if (c === "BR") return { special: "BR" };
  if (c === "D0") return { special: "D0" };
  if (c === "D1") return { special: "D1" };
  if (/^K\d+$/.test(c)) return { pa: -(parseInt(c.slice(1), 10) * 10) }; // K: adds to taxable income
  const m = c.match(/^(\d+)[A-Z]+$/); // e.g. 1257L, 1100M
  if (m) return { pa: parseInt(m[1], 10) * 10 };
  return { pa: 12570 };
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
/**
 * @param {object} opts  { taxCode, employment: "employed"|"self_employed",
 *                         studentLoan: "none"|"plan1"|"plan2"|"plan4"|"plan5"|"postgrad",
 *                         pensionPct: number }
 */
export function estimateTax(appEarnings, otherIncome = 0, region = "rest_of_uk", opts = {}) {
  if (region === "skip") return null; // user hasn't set region yet

  const { taxCode, employment = "employed", studentLoan = "none", pensionPct = 0 } = opts;
  const pension = Math.max(0, (parseFloat(pensionPct) || 0) / 100) * appEarnings; // reduces take-home
  const totalIncome = appEarnings + otherIncome;

  // ---- Income Tax (with tax code + pension relief) ----
  const parsed = parseTaxCode(taxCode);
  let totalIncomeTax;
  if (parsed.special === "NT") {
    totalIncomeTax = 0;
  } else if (parsed.special === "BR") {
    totalIncomeTax = 0.2 * Math.max(0, appEarnings - pension);
  } else if (parsed.special === "D0") {
    totalIncomeTax = 0.4 * Math.max(0, appEarnings - pension);
  } else if (parsed.special === "D1") {
    totalIncomeTax = 0.45 * Math.max(0, appEarnings - pension);
  } else {
    let pa = parsed.pa;
    let taxable = Math.max(0, totalIncome - pension);
    if (pa < 0) { taxable += -pa; pa = 0; } // K code adds to taxable income
    // Personal allowance tapers away above £100k
    if (pa > 0 && totalIncome > 100000) pa = Math.max(0, pa - Math.floor((totalIncome - 100000) / 2));
    totalIncomeTax = calcIncomeTax(taxable, region, pa);
  }

  // ---- National Insurance ----
  const totalNI = employment === "self_employed" ? calcClass4NI(totalIncome) : calcNI(totalIncome);

  // ---- Student loan ----
  const totalStudentLoan = calcStudentLoan(studentLoan, totalIncome);

  // Attribute deductions to this app's share of total income (special codes are already on app earnings)
  const proportion = totalIncome > 0 ? appEarnings / totalIncome : 1;
  const attributedIncomeTax = parsed.special && parsed.special !== "NT" ? totalIncomeTax : totalIncomeTax * proportion;
  const attributedNI = totalNI * proportion;
  const attributedStudentLoan = totalStudentLoan * proportion;

  const totalDeductions = attributedIncomeTax + attributedNI + attributedStudentLoan;
  const takeHome = appEarnings - totalDeductions - pension;
  const effectiveRate = appEarnings > 0 ? totalDeductions / appEarnings : 0;

  return {
    grossEarnings: appEarnings,
    estimatedIncomeTax: attributedIncomeTax,
    estimatedNI: attributedNI,
    estimatedStudentLoan: attributedStudentLoan,
    estimatedPension: pension,
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