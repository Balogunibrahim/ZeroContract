import { useState, useMemo } from "react";
import { X, Check, AlertTriangle, Copy } from "lucide-react";
import { COLORS, FONTS, formatMoney, formatRate } from "../theme";

function inMonth(dateISO, y, m) {
  const d = new Date(dateISO + "T00:00:00");
  return d.getFullYear() === y && d.getMonth() === m;
}

export default function PayslipChecker({ shifts, employers, profile, onClose }) {
  const names = (employers || []).map((e) => e.name);
  const [employer, setEmployer] = useState(names[0] || "");
  const [period, setPeriod] = useState("lastMonth");
  const [gross, setGross] = useState("");
  const [hoursPaid, setHoursPaid] = useState("");
  const [copied, setCopied] = useState(false);

  const periodLabel = useMemo(() => {
    const now = new Date();
    if (period === "thisMonth") return now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (period === "lastMonth") return new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    return "all logged shifts";
  }, [period]);

  const matched = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return shifts.filter((s) => {
      if (employer && s.employer !== employer) return false;
      if (period === "thisMonth") return inMonth(s.date, y, m);
      if (period === "lastMonth") {
        const lm = new Date(y, m - 1, 1);
        return inMonth(s.date, lm.getFullYear(), lm.getMonth());
      }
      return true;
    });
  }, [shifts, employer, period]);

  const expectedGross = matched.reduce((n, s) => n + s.earnings, 0);
  const expectedHours = matched.reduce((n, s) => n + s.hours, 0);
  const paid = parseFloat(gross) || 0;
  const hasGross = gross !== "" && paid >= 0;
  const diff = Math.round((paid - expectedGross) * 100) / 100;
  const hoursDiff = hoursPaid !== "" ? Math.round(((parseFloat(hoursPaid) || 0) - expectedHours) * 10) / 10 : null;

  let verdict = null;
  if (hasGross && matched.length > 0) {
    if (Math.abs(diff) <= 1) verdict = { kind: "ok", title: "Looks right", detail: "Your payslip matches what you logged." };
    else if (diff < 0) verdict = { kind: "under", title: `Underpaid by ${formatMoney(-diff)}`, detail: "Your payslip is less than the shifts you logged for this period." };
    else verdict = { kind: "over", title: `${formatMoney(diff)} more than expected`, detail: "You were paid more than your logged shifts — could be holiday pay, a bonus, or a shift you didn't log." };
  }

  const draft = () => {
    const rateHint = matched[0] ? ` at ${formatRate(matched[0].rate)}/h` : "";
    return `Hi,\n\nI've checked my payslip for ${periodLabel} and it looks about ${formatMoney(-diff)} short. I worked ${matched.length} shift${matched.length === 1 ? "" : "s"} totalling ${expectedHours.toFixed(1)} hours${rateHint}, which I make ${formatMoney(expectedGross)} gross, but I was paid ${formatMoney(paid)}.\n\nCould you take a look and let me know? Thanks,\n${profile?.first_name || ""}`.trim();
  };

  const copyDraft = async () => {
    try { await navigator.clipboard.writeText(draft()); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) { /* ignore */ }
  };

  const noEmployers = names.length === 0;

  return (
    <div style={overlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.bg, borderRadius: 24, maxWidth: 460, width: "100%", padding: "1.5rem", boxShadow: "0 30px 60px -22px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <p style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.ink, margin: 0 }}>Check a payslip</p>
          <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 11, border: `1px solid ${COLORS.border}`, background: "#fff", display: "grid", placeItems: "center", color: COLORS.inkSoft, cursor: "pointer" }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "0 0 18px", lineHeight: 1.5 }}>Enter what your payslip says and I'll check it against the shifts you logged.</p>

        {noEmployers ? (
          <div style={{ ...card, padding: "16px 18px" }}>
            <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>Add an employer to your shifts first, then I can check a payslip against them.</p>
          </div>
        ) : (
          <>
            <label style={flabel}>Employer</label>
            <select aria-label="Employer" value={employer} onChange={(e) => setEmployer(e.target.value)} style={{ ...input, appearance: "none", cursor: "pointer", marginBottom: 14 }}>
              {names.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            <label style={flabel}>Pay period</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["lastMonth", "Last month"], ["thisMonth", "This month"], ["all", "All time"]].map(([id, lbl]) => (
                <button key={id} onClick={() => setPeriod(id)} style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: `1px solid ${period === id ? COLORS.brand : COLORS.border}`, background: period === id ? COLORS.tint : "#fff", color: period === id ? COLORS.deep : COLORS.inkSoft, fontSize: 12.5, fontWeight: 600, fontFamily: FONTS.body, cursor: "pointer" }}>{lbl}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={flabel}>Payslip gross pay (£)</label>
                <input type="number" step="0.01" inputMode="decimal" placeholder="0.00" value={gross} onChange={(e) => setGross(e.target.value)} style={input} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={flabel}>Hours paid (optional)</label>
                <input type="number" step="0.25" inputMode="decimal" placeholder={expectedHours ? expectedHours.toFixed(1) : "0"} value={hoursPaid} onChange={(e) => setHoursPaid(e.target.value)} style={input} />
              </div>
            </div>

            {/* Expected summary */}
            <div style={{ ...card, padding: "13px 16px", marginBottom: 14 }}>
              <Row label={`${matched.length} shift${matched.length === 1 ? "" : "s"} logged`} value={`${expectedHours.toFixed(1)}h`} />
              <Row label="Expected gross" value={formatMoney(expectedGross)} strong />
            </div>

            {verdict && (
              <div style={{ borderRadius: 16, padding: "16px 16px", marginBottom: 14, background: verdict.kind === "under" ? "#FBEAE6" : verdict.kind === "over" ? COLORS.goldTint : COLORS.tint, border: `1px solid ${verdict.kind === "under" ? "#F1C4B8" : verdict.kind === "over" ? "#EFDCAF" : "#CBE6D8"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: "50%", flex: "0 0 34px", display: "grid", placeItems: "center", background: verdict.kind === "under" ? COLORS.danger : verdict.kind === "over" ? COLORS.gold : COLORS.brand, color: "#fff" }}>
                    {verdict.kind === "ok" ? <Check size={18} strokeWidth={2.6} /> : <AlertTriangle size={17} strokeWidth={2.4} />}
                  </span>
                  <div>
                    <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>{verdict.title}</div>
                    <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 1, lineHeight: 1.4 }}>{verdict.detail}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
                  <Mini label="Expected" value={formatMoney(expectedGross)} />
                  <Mini label="Paid" value={formatMoney(paid)} />
                  {hoursDiff != null && <Mini label="Hours diff" value={`${hoursDiff > 0 ? "+" : ""}${hoursDiff.toFixed(1)}h`} />}
                </div>

                {verdict.kind === "under" && (
                  <button onClick={copyDraft} style={{ width: "100%", marginTop: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, border: "none", background: COLORS.deep, color: "#fff", fontFamily: FONTS.body, fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
                    <Copy size={16} /> {copied ? "Copied message" : "Copy a message to your employer"}
                  </button>
                )}
              </div>
            )}

            {!verdict && hasGross && matched.length === 0 && (
              <p style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5, margin: "0 0 6px" }}>No shifts logged for {employer} in {periodLabel}, so there's nothing to compare against.</p>
            )}

            <p style={{ fontSize: 11, color: COLORS.label, marginTop: 8, lineHeight: 1.5 }}>Compares gross pay against your logged shifts. Estimate only — check with your employer for the final word.</p>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(11,33,25,0.55)", zIndex: 65, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: "2rem 1rem", fontFamily: FONTS.body };
const card = { background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 16 };
const flabel = { fontFamily: FONTS.body, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: COLORS.label, display: "block", marginBottom: 6 };
const input = { width: "100%", padding: "11px 13px", boxSizing: "border-box", border: `1px solid ${COLORS.border}`, borderRadius: 12, background: "#fff", fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, outline: "none" };

function Row({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "3px 0" }}>
      <span style={{ fontSize: 13, color: COLORS.inkSoft }}>{label}</span>
      <span style={{ fontFamily: FONTS.display, fontSize: strong ? 16 : 13.5, fontWeight: 700, color: COLORS.ink }}>{value}</span>
    </div>
  );
}
function Mini({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, color: COLORS.ink }}>{value}</div>
      <div style={{ fontSize: 10.5, color: COLORS.label, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600, marginTop: 1 }}>{label}</div>
    </div>
  );
}
