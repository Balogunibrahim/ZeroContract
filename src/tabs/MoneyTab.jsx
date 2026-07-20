import { useState } from "react";
import { ArrowRight } from "lucide-react";
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

export default function MoneyTab({ profile, taxEstimate, baselineEarnings }) {
  const [showCompare, setShowCompare] = useState(false);

  const takePct =
    taxEstimate && taxEstimate.grossEarnings > 0
      ? Math.round(
          (taxEstimate.estimatedTakeHome / taxEstimate.grossEarnings) * 100
        )
      : null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem calc(6rem + env(safe-area-inset-bottom, 0px))" }}>
      <ScreenLabel>Tax &amp; offers</ScreenLabel>
      <DisplayHeader>Money</DisplayHeader>

      <p style={{ ...labelSmall, marginBottom: 12 }}>Tax estimate (this period)</p>

      {taxEstimate ? (
        <>
          {/* Take-home hero */}
          <div
            style={{
              background: "linear-gradient(150deg,#0B4835,#0B3D2E 70%,#092b21)",
              borderRadius: 24,
              padding: "22px 22px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 18px 38px -18px rgba(11,61,46,.6)",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -40,
                top: -50,
                width: 180,
                height: 180,
                background:
                  "radial-gradient(circle,rgba(224,160,43,.22),transparent 70%)",
                borderRadius: "50%",
              }}
            />
            <Ring
              percent={takePct || 0}
              size={72}
              thickness={8}
              color={COLORS.gold}
              track="rgba(255,255,255,0.15)"
            >
              <div style={{ textAlign: "center", lineHeight: 1 }}>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 19,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {takePct != null ? `${takePct}%` : "—"}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "#9FD0BE",
                  }}
                >
                  KEPT
                </div>
              </div>
            </Ring>
            <div style={{ position: "relative", flex: 1 }}>
              <p style={{ ...labelSmall, color: "#9FD0BE", margin: 0 }}>
                Estimated take home
              </p>
              <p
                style={{
                  fontFamily: FONTS.display,
                  fontWeight: 700,
                  fontSize: "clamp(30px, 9vw, 40px)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  margin: "6px 0 0",
                }}
              >
                {formatMoney(taxEstimate.estimatedTakeHome)}
              </p>
            </div>
          </div>

          {/* Breakdown card */}
          <div
            style={{
              ...cardStyle,
              borderRadius: 20,
              padding: "18px 20px 16px",
              marginTop: 14,
              marginBottom: 30,
            }}
          >
            <TaxRow label="Gross earnings" value={formatMoney(taxEstimate.grossEarnings)} />
            <TaxRow
              label="Income Tax"
              value={`−${formatMoney(taxEstimate.estimatedIncomeTax)}`}
              negative
            />
            <TaxRow
              label="National Insurance"
              value={`−${formatMoney(taxEstimate.estimatedNI)}`}
              negative
            />
            <div style={{ borderTop: `1px solid ${COLORS.line}`, margin: "14px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ ...labelSmall, color: COLORS.inkSoft }}>Est. take home</span>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.brand,
                }}
              >
                {formatMoney(taxEstimate.estimatedTakeHome)}
              </span>
            </div>
            <p style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.label, margin: "14px 0 0" }}>
              Rough estimate, not financial advice.
            </p>
          </div>
        </>
      ) : (
        <div
          style={{
            ...cardStyle,
            borderRadius: 20,
            padding: "18px 20px",
            marginBottom: 30,
          }}
        >
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
          gap: 14,
          padding: "16px 18px",
          background: COLORS.card,
          color: COLORS.ink,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 18,
          boxShadow: "0 1px 2px rgba(11,61,46,.05)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            flex: "0 0 44px",
            borderRadius: 14,
            background: COLORS.tint,
            color: COLORS.brand,
            display: "grid",
            placeItems: "center",
          }}
        >
          <ArrowRight size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
            Compare shifts
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }}>
            See if a new offer really pays more after travel
          </div>
        </div>
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

function TaxRow({ label, value, negative }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
      <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft }}>{label}</span>
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize: 15,
          fontWeight: 600,
          color: negative ? COLORS.danger : COLORS.ink,
        }}
      >
        {value}
      </span>
    </div>
  );
}
