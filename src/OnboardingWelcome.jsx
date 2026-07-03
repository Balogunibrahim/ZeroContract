const COLORS = {
  navy: "#15203B",
  paper: "#F7F3EC",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  sage: "#7C9070",
  offwhite: "#EDEAE2",
};
const FONT_DISPLAY = "'Roboto Slab', 'Georgia', serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

export default function OnboardingWelcome({ onAddShift, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(21,32,59,0.92)",
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ background: COLORS.paper, borderRadius: 10, padding: "2rem 1.75rem", maxWidth: 360, width: "100%", fontFamily: FONT_BODY }}>
        <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, margin: "0 0 8px" }}>WELCOME TO</p>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: COLORS.ink, margin: "0 0 16px" }}>Zero Contract</h2>
        <p style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65, marginBottom: 14 }}>
          Track every shift you work, log when you get paid, and see a running estimate of your tax.
        </p>
        <div style={{ borderLeft: `3px solid ${COLORS.amber}`, paddingLeft: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: COLORS.ink }}>Planner tab</strong> &mdash; log past shifts and schedule upcoming ones.
          </p>
        </div>
        <div style={{ borderLeft: `3px solid ${COLORS.sage}`, paddingLeft: 14, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: COLORS.ink }}>Money tab</strong> &mdash; see your tax estimate and compare job offers.
          </p>
        </div>
        <button
          onClick={onAddShift}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 4, border: "none", background: COLORS.ink, color: COLORS.offwhite, cursor: "pointer", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, fontFamily: FONT_BODY }}
        >
          Add your first shift
        </button>
        <button
          onClick={onDismiss}
          style={{ width: "100%", marginTop: 10, padding: "10px", border: "none", background: "none", color: COLORS.inkSoft, cursor: "pointer", fontSize: 13, fontFamily: FONT_BODY }}
        >
          I'll look around first
        </button>
      </div>
    </div>
  );
}
