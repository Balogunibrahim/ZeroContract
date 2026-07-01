import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { estimateTax } from "./taxUtils";

const COLORS = {
  navy: "#15203B",
  paper: "#F7F3EC",
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  amberDeep: "#C97F1E",
  clay: "#C2543F",
  sage: "#7C9070",
  offwhite: "#EDEAE2",
};

const FONT_DISPLAY = "'Roboto Slab', 'Georgia', serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

const fieldLabelStyle = {
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: COLORS.inkSoft,
  fontFamily: FONT_MONO,
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "9px 10px",
  boxSizing: "border-box",
  border: `1px solid ${COLORS.paperDim}`,
  borderBottom: `2px solid ${COLORS.ink}`,
  borderRadius: 3,
  background: "white",
  fontFamily: FONT_BODY,
  fontSize: 14,
  color: COLORS.ink,
  outline: "none",
};

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "GBP" });
}

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
  return { id: uid(), label: "", start: "09:00", end: "17:00", rate: "", travelCost: "0" };
}

export default function ShiftComparison({ profile, baselineEarnings, onClose }) {
  const [candidates, setCandidates] = useState([newCandidate(), newCandidate()]);

  const region =
    profile?.tax_region && profile.tax_region !== "skip" ? profile.tax_region : "rest_of_uk";
  const baseIncome = (baselineEarnings || 0) + (profile?.other_income || 0);

  const updateCandidate = (id, field, value) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(21,32,59,0.85)",
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflowY: "auto",
        padding: "2rem 1rem",
        fontFamily: FONT_BODY,
      }}
    >
      <div style={{ background: COLORS.paper, borderRadius: 8, maxWidth: 560, width: "100%", padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, color: COLORS.inkSoft, margin: 0 }}>
            COMPARE SHIFTS
          </p>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <X size={16} color={COLORS.inkSoft} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "0 0 20px", lineHeight: 1.5 }}>
          Enter details for each shift you're weighing up. We estimate tax on top of what you've already earned this year, then subtract travel cost, so you see what each one really pays.
        </p>

        {candidates.map((c, i) => {
          const r = results.find((res) => res.id === c.id);
          const isBest = best && c.id === best.id && sorted.length > 1;
          return (
            <div
              key={c.id}
              style={{
                background: "white",
                border: isBest ? `2px solid ${COLORS.sage}` : `1px solid ${COLORS.paperDim}`,
                borderRadius: 6,
                padding: "14px 16px",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 }}>
                <input
                  type="text"
                  placeholder={`Shift ${i + 1} (e.g. Tesco Saturday)`}
                  value={c.label}
                  onChange={(e) => updateCandidate(c.id, "label", e.target.value)}
                  style={{
                    border: "none",
                    borderBottom: `1px solid ${COLORS.paperDim}`,
                    background: "none",
                    fontFamily: FONT_BODY,
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.ink,
                    padding: "2px 0",
                    outline: "none",
                    flex: 1,
                    minWidth: 0,
                  }}
                />
                {isBest && (
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      letterSpacing: 1,
                      background: COLORS.sage,
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: 3,
                      whiteSpace: "nowrap",
                    }}
                  >
                    BEST VALUE
                  </span>
                )}
                {candidates.length > 1 && (
                  <button
                    onClick={() => removeCandidate(c.id)}
                    aria-label="Remove shift"
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex", color: COLORS.inkSoft, flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={fieldLabelStyle}>Start</label>
                  <input type="time" value={c.start} onChange={(e) => updateCandidate(c.id, "start", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>End</label>
                  <input type="time" value={c.end} onChange={(e) => updateCandidate(c.id, "end", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Rate / hr</label>
                  <input type="number" step="0.01" placeholder="12.50" value={c.rate} onChange={(e) => updateCandidate(c.id, "rate", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Travel cost</label>
                  <input type="number" step="0.01" placeholder="0" value={c.travelCost} onChange={(e) => updateCandidate(c.id, "travelCost", e.target.value)} style={inputStyle} />
                </div>
              </div>

              {r && r.hours > 0 && r.rate > 0 && (
                <div
                  style={{
                    borderTop: `1px dashed ${COLORS.paperDim}`,
                    paddingTop: 10,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                    gap: 8,
                  }}
                >
                  <MiniStat label="HOURS" value={`${r.hours}h`} />
                  <MiniStat label="GROSS" value={formatMoney(r.gross)} />
                  <MiniStat label="TAX + NI" value={`-${formatMoney(r.deduction)}`} muted />
                  <MiniStat label="TRAVEL" value={`-${formatMoney(r.travelCost)}`} muted />
                  <MiniStat label="NET" value={formatMoney(r.net)} highlight />
                  <MiniStat label="NET / HOUR" value={formatMoney(r.netPerHour)} highlight />
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={addCandidate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "none",
            border: `1px dashed ${COLORS.inkSoft}`,
            borderRadius: 6,
            color: COLORS.inkSoft,
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: 0.5,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          <Plus size={14} /> Add another shift
        </button>

        {best && second && (
          <div style={{ background: COLORS.navy, borderRadius: 6, padding: "14px 16px" }}>
            <p style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, color: COLORS.amber, margin: "0 0 6px" }}>
              VERDICT
            </p>
            <p style={{ color: COLORS.offwhite, fontSize: 14, lineHeight: 1.55, margin: 0 }}>
              {best.label || "Your best option"} pays {formatMoney(Math.max(0, best.netPerHour - second.netPerHour))} more per hour than {second.label || "the next one"}, after tax and travel.
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, color: COLORS.inkSoft, opacity: 0.6, marginTop: 16, lineHeight: 1.5 }}>
          Tax is estimated on top of what you've already logged this year. This is a rough estimate, not financial advice.
        </p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, muted, highlight }) {
  return (
    <div>
      <p style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1, color: COLORS.inkSoft, margin: "0 0 2px" }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: FONT_MONO,
          fontSize: 13,
          fontWeight: highlight ? 600 : 400,
          color: muted ? COLORS.inkSoft : COLORS.ink,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
