import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { COLORS, FONTS, formatMoney, currencySymbol } from "../theme";

const FREE_LIMIT = 10;

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---- The local, data-grounded answer engine -------------------------------
// Answers the highest-value questions directly from the user's own data.
// Returns { text, bars? } where bars is an optional mini ranked chart.
function answerQuestion(q, ctx) {
  const s = (q || "").toLowerCase();
  const { shifts, taxEstimate, totalEarned, totalUnpaid, nextPayday } = ctx;
  const sym = currencySymbol();

  const has = (...words) => words.some((w) => s.includes(w));

  // Best-paying job by real rate (after travel)
  if (has("best", "which job", "highest", "pays the most", "pay the most", "real rate", "worth")) {
    const byEmp = {};
    shifts.forEach((sh) => {
      const e = (sh.employer && sh.employer.trim()) || "Other";
      const b = (byEmp[e] = byEmp[e] || { earn: 0, travel: 0, hours: 0 });
      b.earn += sh.earnings;
      b.travel += sh.travelCost || 0;
      b.hours += sh.hours;
    });
    const list = Object.entries(byEmp)
      .map(([e, v]) => ({ label: e, value: v.hours > 0 ? (v.earn - v.travel) / v.hours : 0 }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
    if (list.length === 0) return { text: "I need a few shifts with an employer and rate first — add some and I'll rank them by what they really pay." };
    const max = list[0].value;
    const top = list[0];
    return {
      text: `${top.label} pays you best — ${sym}${top.value.toFixed(2)}/h once travel is taken off.`,
      bars: list.slice(0, 4).map((x) => ({ ...x, max, display: `${sym}${x.value.toFixed(2)}` })),
      caption: "Real rate per hour, after travel",
    };
  }

  // Tax to set aside / after tax / take home
  if (has("set aside", "owe", "tax")) {
    if (!taxEstimate) return { text: "Set your tax region in Settings and I'll estimate what to put aside." };
    const setAside = taxEstimate.totalDeductions;
    return { text: `On ${formatMoney(taxEstimate.grossEarnings)} so far, set aside about ${formatMoney(setAside)} for tax and National Insurance. That leaves roughly ${formatMoney(taxEstimate.estimatedTakeHome)} to keep.` };
  }
  if (has("after tax", "take home", "takehome", "keep", "net")) {
    if (!taxEstimate) return { text: "Set your tax region in Settings first, then I can work out your take-home." };
    return { text: `You're on track for ${formatMoney(taxEstimate.grossEarnings)} gross. After estimated tax you'll keep about ${formatMoney(taxEstimate.estimatedTakeHome)} — an effective rate of ${(taxEstimate.effectiveRate * 100).toFixed(1)}%.` };
  }

  // Unpaid / owed
  if (has("unpaid", "owed", "owe me", "not paid", "outstanding")) {
    return { text: totalUnpaid > 0 ? `You're owed ${formatMoney(totalUnpaid)} across shifts you've worked but not been paid for yet.` : "Nice — nothing outstanding. Every past shift is marked paid." };
  }

  // Payday
  if (has("payday", "get paid", "paid when", "next pay", "when do i")) {
    if (!nextPayday) return { text: "No payday is set on your upcoming shifts. Add a payday when you log a shift and I'll count it down." };
    const d = new Date(nextPayday + "T00:00:00");
    const days = Math.max(0, Math.round((d - new Date(todayISO() + "T00:00:00")) / 86400000));
    const label = d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    return { text: `Your next payday is ${label}${days === 0 ? " — that's today" : ` — ${days} day${days === 1 ? "" : "s"} away`}. ${totalUnpaid > 0 ? `About ${formatMoney(totalUnpaid)} is due.` : ""}`.trim() };
  }

  // Hours worked
  if (has("hours", "how long", "worked")) {
    const past = shifts.filter((sh) => sh.date < todayISO());
    const hours = past.reduce((sum, sh) => sum + sh.hours, 0);
    return { text: `You've worked ${hours.toFixed(1)} hours across ${past.length} shift${past.length === 1 ? "" : "s"}.` };
  }

  // Shift count
  if (has("how many shifts", "number of shifts", "shifts have")) {
    return { text: `You've logged ${shifts.length} shift${shifts.length === 1 ? "" : "s"} in total.` };
  }

  // Earnings (keep last so "after tax" etc. match first)
  if (has("earn", "earnings", "made", "income", "how much have i", "total")) {
    return { text: `You've earned ${formatMoney(totalEarned)} so far${totalUnpaid > 0 ? `, with ${formatMoney(totalUnpaid)} still to be paid` : ""}.` };
  }

  // Fallback
  return { text: "I can answer about your earnings, take-home after tax, what to set aside, your best-paying job, unpaid pay, and payday. Try one of the suggestions, or ask in your own words." };
}

const SUGGESTIONS = ["Best-paying job", "After-tax total", "Tax to set aside", "When's payday?"];

function ZAvatar({ size = 26, radius = 8 }) {
  return (
    <span style={{ width: size, height: size, flex: `0 0 ${size}px`, borderRadius: radius, background: COLORS.deep, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.display, fontWeight: 700, fontSize: size * 0.5, color: "#7FC9AC" }}>Z</span>
  );
}

function Bars({ bars }) {
  return (
    <div style={{ marginTop: 11, display: "flex", flexDirection: "column", gap: 8 }}>
      {bars.map((b) => (
        <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 78, fontSize: 12, color: COLORS.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.label}</div>
          <div style={{ flex: 1, height: 9, background: "var(--zc-subtle)", borderRadius: 5, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${Math.round((b.value / b.max) * 100)}%`, background: COLORS.brand }} />
          </div>
          <div style={{ width: 54, textAlign: "right", fontFamily: FONTS.display, fontSize: 12.5, fontWeight: 700, color: COLORS.ink }}>{b.display}</div>
        </div>
      ))}
    </div>
  );
}

export default function ZeroTab({ firstName, shifts, taxEstimate, totalEarned, totalUnpaid, nextPayday, profile, onSaveUsage }) {
  const greeting = `Evening${firstName ? `, ${firstName}` : ""}. Ask me anything about your shifts, pay, or tax.`;
  const [messages, setMessages] = useState([{ from: "zero", text: greeting }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  const usage = profile?.settings?.zero || { month: monthKey(), count: 0 };
  const [count, setCount] = useState(usage.month === monthKey() ? usage.count : 0);
  const remaining = Math.max(0, FREE_LIMIT - count);
  const isPlus = !!profile?.settings?.zeroPlus;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const ctx = { shifts, taxEstimate, totalEarned, totalUnpaid, nextPayday };

  const ask = (text) => {
    const q = (text || "").trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");

    if (!isPlus && remaining <= 0) {
      setMessages((m) => [...m, { from: "zero", upgrade: true, text: "You've used your 10 free questions this month. Go Zero+ for unlimited answers, plus the payslip checker and tax co-pilot." }]);
      return;
    }

    setTyping(true);
    setTimeout(() => {
      const a = answerQuestion(q, ctx);
      setTyping(false);
      setMessages((m) => [...m, { from: "zero", ...a }]);
      if (!isPlus) {
        const next = { month: monthKey(), count: count + 1 };
        setCount(next.count);
        onSaveUsage && onSaveUsage(next);
      }
    }, 450);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100dvh - 150px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))", minHeight: 420 }}>
      {/* header */}
      <div style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label, margin: "0 0 4px" }}>Ask about your money</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ZAvatar size={34} radius={11} />
          <h1 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: COLORS.ink, margin: 0 }}>Zero</h1>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "10px 1.25rem 6px" }}>
        {messages.map((m, i) => (
          m.from === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <div style={{ maxWidth: "80%", background: COLORS.brand, color: "#fff", borderRadius: "16px 16px 5px 16px", padding: "11px 13px", fontSize: 14, lineHeight: 1.45 }}>{m.text}</div>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-end", marginBottom: 12 }}>
              <ZAvatar />
              <div style={{ maxWidth: "86%", background: m.upgrade ? COLORS.goldTint : COLORS.card, border: `1px solid ${m.upgrade ? "#EFDCAF" : COLORS.border}`, borderRadius: "16px 16px 16px 5px", padding: "12px 13px", fontSize: 14, color: COLORS.ink, lineHeight: 1.5 }}>
                {m.text}
                {m.bars && <Bars bars={m.bars} />}
                {m.caption && <div style={{ fontSize: 11, color: COLORS.label, marginTop: 6 }}>{m.caption}</div>}
                {m.upgrade && (
                  <div style={{ marginTop: 12, background: COLORS.gold, color: COLORS.deep, textAlign: "center", fontWeight: 700, fontSize: 13, padding: 10, borderRadius: 11, cursor: "pointer" }}>Go Zero+</div>
                )}
              </div>
            </div>
          )
        ))}

        {typing && (
          <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}>
            <ZAvatar />
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "12px 15px", display: "flex", gap: 5 }}>
              <Dot /><Dot delay={0.15} /><Dot delay={0.3} />
            </div>
          </div>
        )}

        {messages.length <= 1 && !typing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "2px 0 0 35px" }}>
            {SUGGESTIONS.map((sug) => (
              <button key={sug} onClick={() => ask(sug)} style={{ fontSize: 12, color: COLORS.deep, background: COLORS.tint, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "7px 12px", cursor: "pointer", fontFamily: FONTS.body }}>{sug}</button>
            ))}
          </div>
        )}
      </div>

      {/* composer */}
      <div style={{ padding: "8px 1.25rem 10px" }}>
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} style={{ display: "flex", alignItems: "center", gap: 9, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 22, padding: "5px 6px 5px 15px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zero…"
            aria-label="Ask Zero"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink }}
          />
          <button type="submit" aria-label="Send" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: COLORS.brand, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <ArrowUp size={18} color="#fff" />
          </button>
        </form>
        <div style={{ textAlign: "center", fontSize: 10.5, color: COLORS.label, marginTop: 8 }}>
          {isPlus ? "Zero+ · unlimited" : (<>{remaining} free question{remaining === 1 ? "" : "s"} left this month · <span style={{ color: COLORS.brand }}>Go Zero+ for unlimited</span></>)}
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }) {
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.label, animation: `zeroblink 1s ${delay}s infinite ease-in-out` }} />;
}
