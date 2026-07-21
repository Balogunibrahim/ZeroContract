import { useState } from "react";
import { Scale } from "lucide-react";
import ShiftComparison from "../components/ShiftComparison";
import {
  COLORS,
  FONTS,
  ScreenLabel,
  DisplayHeader,
  cardStyle,
  formatMoney,
  Ring,
} from "../theme";

const REGION_LABEL = {
  rest_of_uk: "England, Wales & NI",
  scotland: "Scotland",
};

export default function MoneyTab({ profile, taxEstimate, baselineEarnings }) {
  const [showCompare, setShowCompare] = useState(false);

  const gross = taxEstimate ? taxEstimate.grossEarnings : 0;
  const takeHome = taxEstimate ? taxEstimate.estimatedTakeHome : 0;
  const incomeTax = taxEstimate ? taxEstimate.estimatedIncomeTax : 0;
  const ni = taxEstimate ? taxEstimate.estimatedNI : 0;
  const keepPct = taxEstimate && gross > 0 ? Math.round((takeHome / gross) * 100) : null;
  const effPct = taxEstimate ? (taxEstimate.effectiveRate * 100).toFixed(1) : null;
  const regionLabel = REGION_LABEL[profile?.tax_region];

  const pct = (part) => (gross > 0 ? (part / gross) * 100 : 0);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem calc(6rem + env(safe-area-inset-bottom, 0px))" }}>
      <ScreenLabel>Tax &amp; offers</ScreenLabel>
      <DisplayHeader>Money</DisplayHeader>

      {taxEstimate ? (
        <>
          <SectionLabel style={{ marginTop: 0 }}>Tax estimate (this period)</SectionLabel>

          {/* Take-home hero */}
          <div style={{ background: "linear-gradient(150deg,#0B4835,#0B3D2E 70%,#092b21)", borderRadius: 24, padding: "20px 22px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 18px 38px -18px rgba(11,61,46,.6)", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "absolute", right: -40, top: -50, width: 180, height: 180, background: "radial-gradient(circle,rgba(224,160,43,.22),transparent 70%)", borderRadius: "50%" }} />
            <Ring percent={keepPct || 0} size={74} thickness={8} color={COLORS.gold} track="rgba(255,255,255,0.15)">
              <div style={{ textAlign: "center", lineHeight: 1 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, color: "#F0C766" }}>{keepPct != null ? `${keepPct}%` : "—"}</div>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "#9FD0BE", marginTop: 2 }}>KEPT</div>
              </div>
            </Ring>
            <div style={{ position: "relative", flex: 1 }}>
              <p style={{ fontSize: 11, color: "#9FD0BE", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, margin: 0 }}>Estimated take home</p>
              <p style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(28px, 8.5vw, 34px)", lineHeight: 1, letterSpacing: "-0.02em", margin: "4px 0 0" }}>{formatMoney(takeHome)}</p>
            </div>
          </div>

          {/* Plain-language insight */}
          {keepPct != null && (
            <div style={{ ...cardStyle, borderRadius: 18, padding: "15px 16px", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, color: COLORS.ink }}>
                You keep <span style={{ color: COLORS.brand }}>{keepPct}p</span> of every £1
              </span>
              {regionLabel && (
                <span style={{ fontSize: 10.5, fontWeight: 600, color: COLORS.inkSoft, background: "var(--zc-subtle)", padding: "5px 10px", borderRadius: 8, whiteSpace: "nowrap" }}>{regionLabel}</span>
              )}
            </div>
          )}

          {/* Where it went — stacked bar */}
          <SectionLabel>Where your £{Math.round(gross).toLocaleString()} went</SectionLabel>
          <div style={{ ...cardStyle, borderRadius: 20, padding: "18px 20px" }}>
            <div style={{ height: 16, borderRadius: 8, overflow: "hidden", display: "flex", margin: "4px 0 14px", background: "var(--zc-subtle)" }}>
              <span style={{ height: "100%", width: `${pct(takeHome)}%`, background: COLORS.brand }} />
              <span style={{ height: "100%", width: `${pct(incomeTax)}%`, background: COLORS.danger }} />
              <span style={{ height: "100%", width: `${pct(ni)}%`, background: COLORS.gold }} />
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <LegendItem color={COLORS.brand} label="Take home" value={formatMoney(takeHome)} />
              <LegendItem color={COLORS.danger} label="Income Tax" value={formatMoney(incomeTax)} />
              <LegendItem color={COLORS.gold} label="Nat. Insurance" value={formatMoney(ni)} />
            </div>
          </div>

          {/* The maths */}
          <SectionLabel>The maths</SectionLabel>
          <div style={{ ...cardStyle, borderRadius: 20, padding: "8px 20px 18px" }}>
            <TaxRow label="Gross earnings" value={formatMoney(gross)} first />
            <TaxRow label="Income Tax" value={`−${formatMoney(incomeTax)}`} negative />
            <TaxRow label="National Insurance" value={`−${formatMoney(ni)}`} negative />
            <div style={{ borderTop: `2px solid ${COLORS.ink}`, marginTop: 4, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: COLORS.inkSoft }}>Est. take home</span>
              <span style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.brand }}>{formatMoney(takeHome)}</span>
            </div>
            <p style={{ fontFamily: FONTS.body, fontSize: 11.5, color: COLORS.label, margin: "12px 0 0" }}>
              Effective rate {effPct}%. Rough estimate, not financial advice.
            </p>
          </div>
        </>
      ) : (
        <div style={{ ...cardStyle, borderRadius: 20, padding: "18px 20px" }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>
            Set your tax region in Settings to see a tax estimate here.
          </p>
        </div>
      )}

      {/* Compare CTA */}
      <SectionLabel>Weigh up an offer</SectionLabel>
      <button
        onClick={() => setShowCompare(true)}
        style={{ ...cardStyle, borderRadius: 20, width: "100%", display: "flex", alignItems: "center", gap: 14, padding: 16, cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ width: 46, height: 46, flex: "0 0 46px", borderRadius: 14, background: COLORS.tint, color: COLORS.brand, display: "grid", placeItems: "center" }}>
          <Scale size={22} strokeWidth={2} />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontFamily: FONTS.display, fontSize: 15.5, fontWeight: 700, color: COLORS.ink }}>Compare shifts</span>
          <span style={{ display: "block", fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }}>See if a new offer really pays more after travel</span>
        </span>
      </button>

      {showCompare && (
        <ShiftComparison profile={profile} baselineEarnings={baselineEarnings} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}

function SectionLabel({ children, style }) {
  return (
    <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label, margin: "22px 4px 12px", ...style }}>{children}</p>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: COLORS.inkSoft }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
      {label} <b style={{ fontFamily: FONTS.display, color: COLORS.ink, fontWeight: 700 }}>{value}</b>
    </div>
  );
}

function TaxRow({ label, value, negative, first }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", fontSize: 14.5, borderTop: first ? "none" : `1px solid ${COLORS.line}` }}>
      <span style={{ fontFamily: FONTS.body, color: COLORS.ink }}>{label}</span>
      <span style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 600, color: negative ? COLORS.danger : COLORS.ink }}>{value}</span>
    </div>
  );
}
