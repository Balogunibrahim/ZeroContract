import { useState } from "react";
import ShiftComparison from "../ShiftComparison";

const COLORS = {
  navy: "#15203B",
  paper: "#F7F3EC",
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  offwhite: "#EDEAE2",
};
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";
const FONT_BODY = "'Inter', -apple-system, sans-serif";

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "GBP" });
}

export default function MoneyTab({ profile, taxEstimate, baselineEarnings }) {
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem 5rem" }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: COLORS.inkSoft, marginBottom: 10 }}>
        TAX ESTIMATE
      </p>

      {taxEstimate ? (
        <div style={{ background: COLORS.navy, borderRadius: 8, padding: "1.25rem", marginBottom: 24 }}>
          <TaxRow label="Gross earnings" value={taxEstimate.grossEarnings} />
          <TaxRow label="Income Tax" value={taxEstimate.estimatedIncomeTax} />
          <TaxRow label="National Insurance" value={taxEstimate.estimatedNI} />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", margin: "10px 0" }} />
          <TaxRow label="Estimated take-home" value={taxEstimate.estimatedTakeHome} highlight />
          <p style={{ color: COLORS.offwhite, opacity: 0.4, fontFamily: FONT_BODY, fontSize: 11, margin: "12px 0 0", lineHeight: 1.5 }}>
            Rough estimate, {taxEstimate.region === "scotland" ? "Scottish" : "England/Wales/NI"} 2025/26 rates. Not financial advice.
          </p>
        </div>
      ) : (
        <div style={{ background: "white", border: `1px solid ${COLORS.paperDim}`, borderRadius: 8, padding: "1.25rem", marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5, margin: 0 }}>
            Set your tax region in the Profile tab to see a tax estimate here.
          </p>
        </div>
      )}

      <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: COLORS.inkSoft, marginBottom: 10 }}>
        WEIGH UP AN OFFER
      </p>
      <button
        onClick={() => setShowCompare(true)}
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          padding: "12px 16px",
          background: "white",
          color: COLORS.ink,
          border: `1px solid ${COLORS.paperDim}`,
          borderRadius: 6,
          fontFamily: FONT_MONO,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 1,
          cursor: "pointer",
        }}
      >
        COMPARE SHIFTS
      </button>

      {showCompare && (
        <ShiftComparison profile={profile} baselineEarnings={baselineEarnings} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}

function TaxRow({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ color: COLORS.offwhite, opacity: highlight ? 1 : 0.65, fontFamily: FONT_MONO, fontSize: 13 }}>{label}</span>
      <span style={{ color: highlight ? COLORS.amber : COLORS.offwhite, opacity: highlight ? 1 : 0.85, fontFamily: FONT_MONO, fontSize: 13, fontWeight: highlight ? 600 : 400 }}>
        {formatMoney(value)}
      </span>
    </div>
  );
}
