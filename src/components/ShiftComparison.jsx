import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { estimateTax } from "../utils/taxUtils";
import { COLORS, FONTS, formatMoney } from "../theme";

const fieldLabelStyle = {
  fontFamily: FONTS.body,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: COLORS.label,
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "4px 0",
  boxSizing: "border-box",
  border: "none",
  borderBottom: `1px solid ${COLORS.ink}`,
  borderRadius: 0,
  background: "transparent",
  fontFamily: FONTS.body,
  fontSize: 17,
  fontWeight: 600,
  color: COLORS.ink,
  outline: "none",
};

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function newCandidate() {
  return { id: uid(), start: "09:00", end: "17:00", rate: "", travelCost: "0" };
}

export default function ShiftComparison({ profile, baselineEarnings, onClose }) {
  const [candidates, setCandidates] = useState([newCandidate(), newCandidate()]);

  const region = profile?.tax_region && profile.tax_region !== "skip" ? profile.tax_region : "rest_of_uk";
  const baseIncome = (baselineEarnings || 0) + (profile?.other_income || 0);

  const updateCandidate = (id, field, value) =>
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  const addCandidate = () => setCandidates((prev) => [...prev, newCandidate()]);
  const removeCandidate = (id) => setCandidates((prev) => prev.filter((c) => c.id !== id));

  const results = candidates.map((c) => {
    const hours = calcHours(c.start, c.end);
    const rate = parseFloat(c.rate) || 0;
    const travelCost = parseFloat(c.travelCost) || 0;
    const gross = Math.round(hours * rate * 100) / 100;
    const withShift = estimateTax(baseIncome + gross, 0, region);
    const withoutShift = estimateTax(baseIncome, 0, region);
    const deduction = Math.max(0, withShift.totalDeductions - withoutShift.totalDeductions);
    const net = gross - deduction - travelCost;
    const netPerHour = hours > 0 ? net / hours : 0;
    return { ...c, hours, rate, travelCost, gross, deduction, net, netPerHour };
  });

  const validResults = results.filter((r) => r.hours > 0 && r.rate > 0);
  const sorted = [...validResults].sort((a, b) => b.netPerHour - a.netPerHour);
  const best = sorted[0];
  const second = sorted[1];
  const bestIndex = best ? candidates.findIndex((c) => c.id === best.id) + 1 : 0;

  return (
    <div style={overlayStyle}>
      <div style={{ background: COLORS.bg, borderRadius: 2, maxWidth: 560, width: "100%", padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.ink, margin: 0 }}>
            Compare shifts
          </p>
          <button onClick={onClose} style={iconBtn}><X size={18} color={COLORS.inkSoft} /></button>
        </div>
        <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.inkSoft, margin: "0 0 22px", lineHeight: 1.5 }}>
          Enter two or more offers. We'll show which one actually pays more per hour after tax and travel.
        </p>

        {candidates.map((c, i) => {
          const r = results.find((res) => res.id === c.id);
          const isBest = best && c.id === best.id && sorted.length > 1;
          return (
            <div
              key={c.id}
              style={{
                position: "relative",
                background: COLORS.card,
                border: `${isBest ? 1.5 : 1}px solid ${isBest ? COLORS.ink : COLORS.border}`,
                borderRadius: 2,
                padding: "18px 18px 16px",
                marginBottom: 14,
              }}
            >
              {isBest && (
                <span style={{ position: "absolute", top: -1, right: -1, background: COLORS.black, color: "#fff", fontFamily: FONTS.body, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, padding: "5px 9px" }}>
                  BEST VALUE
                </span>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, marginBottom: 16, borderBottom: `1px solid ${COLORS.line}` }}>
                <span style={{ fontFamily: FONTS.body, fontSize: 18, fontWeight: 700, color: COLORS.ink }}>Shift {i + 1}</span>
                {candidates.length > 1 && (
                  <button onClick={() => removeCandidate(c.id)} aria-label="Remove shift" style={{ ...iconBtn, marginRight: isBest ? 70 : 0 }}>
                    <Trash2 size={15} color={COLORS.label} />
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 16 }}>
                <Field label="Start"><input type="time" value={c.start} onChange={(e) => updateCandidate(c.id, "start", e.target.value)} style={inputStyle} /></Field>
                <Field label="End"><input type="time" value={c.end} onChange={(e) => updateCandidate(c.id, "end", e.target.value)} style={inputStyle} /></Field>
                <Field label="Rate £/hr"><input type="number" step="0.01" placeholder="12.50" value={c.rate} onChange={(e) => updateCandidate(c.id, "rate", e.target.value)} style={inputStyle} /></Field>
                <Field label="Travel £"><input type="number" step="0.01" placeholder="0" value={c.travelCost} onChange={(e) => updateCandidate(c.id, "travelCost", e.target.value)} style={inputStyle} /></Field>
              </div>

              {r && r.hours > 0 && r.rate > 0 && (
                <div style={{ borderTop: `1px dashed ${COLORS.line}`, paddingTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px 10px" }}>
                  <MiniStat label="Hours" value={r.hours.toFixed(1)} />
                  <MiniStat label="Gross" value={formatMoney(r.gross)} />
                  <MiniStat label="Tax + NI" value={`−${formatMoney(r.deduction)}`} muted />
                  <MiniStat label="Travel" value={`−${formatMoney(r.travelCost)}`} muted />
                  <MiniStat label="Net" value={formatMoney(r.net)} strong />
                  <MiniStat label="Net / hr" value={formatMoney(r.netPerHour)} strong />
                </div>
              )}
            </div>
          );
        })}

        <button onClick={addCandidate} style={addBtn}>
          <Plus size={15} /> Add another shift
        </button>

        {best && second && (
          <div style={{ background: COLORS.black, borderRadius: 2, padding: "16px 18px", marginTop: 20 }}>
            <p style={{ fontFamily: FONTS.body, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "0 0 8px" }}>
              Verdict
            </p>
            <p style={{ fontFamily: FONTS.body, fontSize: 14.5, color: "#fff", margin: 0, lineHeight: 1.5 }}>
              <strong>Shift {bestIndex}</strong> pays you {formatMoney(Math.max(0, best.netPerHour - second.netPerHour))} more per hour after tax and travel.
            </p>
          </div>
        )}

        <p style={{ fontFamily: FONTS.body, fontSize: 11.5, color: COLORS.label, marginTop: 16, lineHeight: 1.5 }}>
          Tax is estimated on top of what you've already logged this year. Rough estimate, not financial advice.
        </p>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(20,20,20,0.6)",
  zIndex: 50,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflowY: "auto",
  padding: "2rem 1rem",
  fontFamily: FONTS.body,
};

const iconBtn = { border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex" };

const addBtn = {
  width: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "16px",
  background: "none",
  border: `1px dashed ${COLORS.inkSoft}`,
  borderRadius: 2,
  color: COLORS.inkSoft,
  fontFamily: FONTS.body,
  fontSize: 13,
  cursor: "pointer",
};

function Field({ label, children }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  );
}

function MiniStat({ label, value, muted, strong }) {
  return (
    <div>
      <p style={{ fontFamily: FONTS.body, fontSize: 9.5, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: COLORS.label, margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: strong ? 700 : 500, color: muted ? COLORS.inkSoft : COLORS.ink, margin: 0 }}>{value}</p>
    </div>
  );
}
