import { useState } from "react";
import { ArrowRight } from "lucide-react";
import ShiftComparison from "../components/ShiftComparison";
import { COLORS, FONTS, ScreenLabel, DisplayHeader, formatMoney } from "../theme";

export default function MoneyTab({ profile, taxEstimate, baselineEarnings }) {
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.75rem 1.25rem 6rem" }}>
      <ScreenLabel>Tax &amp; offers</ScreenLabel>
      <DisplayHeader>Money</DisplayHeader>

      <p style={{ ...labelSmall, marginBottom: 12 }}>Tax estimate (this period)</p>

      {taxEstimate ? (
        <div style={{ background: COLORS.black, borderRadius: 2, padding: "22px 22px 20px", marginBottom: 30 }}>
          <TaxRow label="Gross earnings" value={formatMoney(taxEstimate.grossEarnings)} />
          <TaxRow label="Income Tax" value={`−${formatMoney(taxEstimate.estimatedIncomeTax)}`} />
          <TaxRow label="National Insurance" value={`−${formatMoney(taxEstimate.estimatedNI)}`} />
          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.25)", margin: "16px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
              Est. take home
            </span>
            <span style={{ fontFamily: FONTS.body, fontSize: 22, fontWeight: 700, color: "#fff" }}>
              {formatMoney(taxEstimate.estimatedTakeHome)}
            </span>
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "14px 0 0" }}>
            Rough estimate, not financial advice.
          </p>
        </div>
      ) : (
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 2, padding: "18px 20px", marginBottom: 30 }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>
            Set your tax region in the Profile tab to see a tax estimate here.
          </p>
        </div>
      )}

      <p style={{ ...labelSmall, marginBottom: 12 }}>Weigh up an offer</p>
      <button
        onClick={() => setShowCompare(true)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "18px 16px",
          background: COLORS.card,
          color: COLORS.ink,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 2,
          fontFamily: FONTS.body,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Compare shifts <ArrowRight size={15} />
      </button>

      {showCompare && (
        <ShiftComparison profile={profile} baselineEarnings={baselineEarnings} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}

const labelSmall = {
  fontFamily: FONTS.body,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: COLORS.label,
  margin: 0,
};

function TaxRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
      <span style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
        {label}
      </span>
      <span style={{ fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: "#fff" }}>{value}</span>
    </div>
  );
}
