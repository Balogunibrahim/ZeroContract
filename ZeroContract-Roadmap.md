# Zero Contract — Product Roadmap

*From a shift tracker to a money-and-work platform for UK shift workers.*

## Guiding principle

Build on strengths before chasing new territory. The hard part — a trusted app that knows a worker's real numbers — is done. Deepen that into a money co-pilot people pay for, and let revenue fund the bigger, partner-heavy bets (shift discovery, credentials, career) later. Never run more than one large, partnership-dependent bet at a time.

Effort is rough build size: **S** = days, **M** = 1–3 weeks, **L** = 1–2 months+ (often needs partners or external data).

---

## Where we are (Phase 0 — done)

| Pillar | Status |
|---|---|
| Work management | Solid — shifts, calendar, roster, employers, timesheets, reminders |
| Financial planning | Partial — earnings, tax/NI estimate, take-home, unpaid, real rate, payday |
| AI (Zero) | v1 — chat over your own data, capped free tier, LLM backend deployed |
| Employment guidance | Emerging — only what the LLM can answer |
| Payroll verification | Manual only (mark paid/unpaid) |
| AI recommendations | Reactive (chat + compare tool) |
| Shift discovery | Not started |
| Career development | Not started |
| Professional profile / credentials | Minimal (basic profile) |

Foundation, auth, dark mode, PWA, domain, and Zero's core are live.

---

## Phase 1 — Monetise what exists (0–1 month)

Goal: turn the existing product into revenue and ship the killer feature. Low cost, high leverage.

| Item | Effort | Why |
|---|---|---|
| Switch on Zero AI + spend caps | S | Makes Zero fully intelligent; caps protect against loss |
| **Payslip / underpayment checker** (Zero+) | M | Flagship paid feature; catches real money using data you already hold |
| Zero+ payments via Stripe | M | Makes the upgrade button charge and unlock unlimited |
| Proactive nudges | S–M | "You're owed £X", "shift not worth the travel" — turns Zero from reactive to a co-pilot |

**Outcome:** paying subscribers + your strongest hook. **Cost:** near zero (free tiers + capped AI). **Monetisation:** Zero+ at £2.99/mo or £25/yr.

---

## Phase 2 — Deepen financial planning (1–3 months)

Goal: become a money co-pilot, not just a tracker. Drives retention.

| Item | Effort | Why |
|---|---|---|
| Set-aside pots + savings goals | M | Tax/savings buckets people can trust |
| Income forecasting | M | "You're on track for £X this month/year" |
| Holiday-pay + entitlement calculator | M | Rights that translate to money owed |
| Light expense tracking | M | Beyond travel — a fuller picture |

**Outcome:** clear "worth keeping the subscription" value. **Cost:** still on free/low tiers. **Monetisation:** strengthens Zero+.

---

## Phase 3 — Guidance + credentials groundwork (3–6 months)

Goal: trust and differentiation; lay the rails for discovery.

| Item | Effort | Why |
|---|---|---|
| Employment guidance (min wage, holiday, contract Q&A) | M | Zero + a curated UK knowledge base = real answers, safely framed |
| Professional profile + credentials store | M–L | Upload right-to-work, DBS, certs; a shareable profile |

**Outcome:** stickiness + the profile that discovery will need. **Cost:** low–moderate (storage, content). **Risk:** keep guidance as "estimates/guidance", not regulated advice.

---

## Phase 4 — Platform bets (6–12 months+)

Goal: expand into the biggest pillars. Only after a paying base funds them — these need partnerships, data, and possibly regulation.

| Item | Effort | Why / risk |
|---|---|---|
| Shift discovery (jobs feed / agency partnerships) | L | Marketplace + business development; the hardest new pillar |
| Career development (training, progression) | L | Largely partner-driven (course/qualification providers) |

**Outcome:** the full "platform". **Cost:** highest (BD, integrations, possibly headcount). **Rule:** don't start until Phases 1–2 are paying.

---

## Costs & unit economics

- **AI:** ~£0.0004 per question. Free cap (10/mo) ≈ half a penny per free user per month. Zero+ users pay far more than they cost.
- **Infra:** Supabase + Vercel free tiers cover thousands of users; upgrade (~£40/mo total) only when paying users justify it.
- **Watch:** Google Maps usage — set daily quotas + budget alerts.
- **Break-even:** ~15 Zero+ subscribers at £2.99 covers paid-tier fixed costs.
- **Guardrails:** hard spend limits on OpenAI and Google Cloud so worst case is bounded, not open-ended.
- **Payments:** Stripe on web keeps ~98% vs app-store 15–30%.

## Risks to manage

- **Focus/cash:** one big bet at a time; Phase 4 only after revenue.
- **Regulation:** money/tax framing stays "guidance, not advice" (FCA); credentials + data need GDPR care.
- **AI trust:** keep answers grounded in the user's real data; never invent numbers.

## Success signals

- Phase 1: first paying Zero+ subscribers; payslip checker catches a real underpayment.
- Phase 2: subscription retention holding month over month.
- Phase 3–4: profile completion rate; discovery only pursued once the paying base funds it.
