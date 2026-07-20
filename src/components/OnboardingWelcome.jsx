import { PoundSterling, Clock, Scale } from "lucide-react";
import { COLORS, FONTS, LogoLockup } from "../theme";

const FEATURES = [
  {
    icon: PoundSterling,
    bg: COLORS.tint,
    color: COLORS.brand,
    title: "Your real hourly rate",
    body: "See what a shift truly pays once travel is counted.",
  },
  {
    icon: Clock,
    bg: COLORS.goldTint,
    color: "#B77E17",
    title: "Payday countdown",
    body: "Know how many days until you get paid, and how much.",
  },
  {
    icon: Scale,
    bg: COLORS.tint,
    color: COLORS.brand,
    title: "Compare two shifts",
    body: "Find which offer leaves more money in your pocket.",
  },
];

export default function OnboardingWelcome({ firstName, onAddShift, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: COLORS.bg,
        display: "flex",
        justifyContent: "center",
        fontFamily: FONTS.body,
        textAlign: "left",
        overflowY: "auto",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", padding: "34px 26px 26px", minHeight: "100%", boxSizing: "border-box" }}>
        <div style={{ marginBottom: 26 }}>
          <LogoLockup size={32} />
        </div>

        <h2 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.ink, margin: "0 0 8px" }}>
          Welcome{firstName ? `, ${firstName}` : ""}
        </h2>
        <p style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.6, margin: "0 0 22px" }}>
          Here's what you can do. Log a shift once and the app does the maths for the rest.
        </p>

        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, flex: "0 0 42px", borderRadius: 13, display: "grid", placeItems: "center", background: f.bg, color: f.color }}>
                <Icon size={21} strokeWidth={2} />
              </div>
              <div>
                <b style={{ fontFamily: FONTS.display, fontSize: 14.5, fontWeight: 700, color: COLORS.ink, display: "block" }}>{f.title}</b>
                <p style={{ fontSize: 12.5, color: COLORS.inkSoft, margin: "2px 0 0", lineHeight: 1.45 }}>{f.body}</p>
              </div>
            </div>
          );
        })}

        <div style={{ flex: 1, minHeight: 20 }} />

        <button
          onClick={onAddShift}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg,#0A7B57,#0B3D2E)",
            color: "#fff",
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 12px 24px -10px rgba(10,123,87,.55)",
          }}
        >
          Add your first shift
        </button>
        <button
          onClick={onDismiss}
          style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", background: "none", color: COLORS.inkSoft, fontFamily: FONTS.body, fontWeight: 600, fontSize: 14, cursor: "pointer", marginTop: 8 }}
        >
          I'll explore first
        </button>
      </div>
    </div>
  );
}
