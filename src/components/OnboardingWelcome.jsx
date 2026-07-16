import { COLORS, FONTS } from "../theme";

export default function OnboardingWelcome({ onAddShift, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,20,20,0.6)",
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ background: COLORS.bg, borderRadius: 2, padding: "2rem 1.75rem", maxWidth: 360, width: "100%", fontFamily: FONTS.body, textAlign: "left" }}>
        <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label, margin: "0 0 8px" }}>
          Welcome to
        </p>
        <h2 style={{ fontFamily: FONTS.display, fontWeight: 400, fontSize: 30, textTransform: "uppercase", letterSpacing: "-0.01em", color: COLORS.ink, margin: "0 0 16px" }}>
          Zero Contract
        </h2>
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65, marginBottom: 16 }}>
          Track every shift you work, log when you get paid, and see a running estimate of your tax.
        </p>
        <div style={{ borderLeft: `2px solid ${COLORS.ink}`, paddingLeft: 14, marginBottom: 14 }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.inkSoft, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: COLORS.ink }}>Planner tab</strong> — log past shifts and schedule upcoming ones.
          </p>
        </div>
        <div style={{ borderLeft: `2px solid ${COLORS.ink}`, paddingLeft: 14, marginBottom: 24 }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.inkSoft, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: COLORS.ink }}>Money tab</strong> — see your tax estimate and compare job offers.
          </p>
        </div>
        <button
          onClick={onAddShift}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 2, border: "none", background: COLORS.black, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: FONTS.body }}
        >
          Add your first shift
        </button>
        <button
          onClick={onDismiss}
          style={{ width: "100%", marginTop: 10, padding: "10px", border: "none", background: "none", color: COLORS.inkSoft, cursor: "pointer", fontSize: 13, fontFamily: FONTS.body }}
        >
          I'll look around first
        </button>
      </div>
    </div>
  );
}
