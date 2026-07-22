import { Home, List, Wallet, Car } from "lucide-react";
import { COLORS, FONTS } from "../theme";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "planner", label: "Shifts", icon: List },
  { id: "zero", label: "Zero", center: true },
  { id: "money", label: "Money", icon: Wallet },
  { id: "travel", label: "Travel", icon: Car },
];

export default function BottomNav({ active, onChange }) {
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40 }}>
      <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "flex-end",
            background: "var(--zc-nav)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderTop: `1px solid ${COLORS.line}`,
            paddingTop: 8,
            paddingLeft: "calc(10px + env(safe-area-inset-left, 0px))",
            paddingRight: "calc(10px + env(safe-area-inset-right, 0px))",
            paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {TABS.map((t) => {
            const isActive = active === t.id;

            if (t.center) {
              return (
                <button
                  key={t.id}
                  onClick={() => onChange(t.id)}
                  aria-label="Zero assistant"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: "none", background: "none", cursor: "pointer", marginTop: -18 }}
                >
                  <span
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      background: COLORS.deep,
                      border: "3px solid var(--zc-nav)",
                      boxShadow: "0 10px 20px -6px rgba(11,61,46,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONTS.display,
                      fontWeight: 700,
                      fontSize: 26,
                      color: "#7FC9AC",
                      lineHeight: 1,
                    }}
                  >
                    Z
                  </span>
                  <span style={{ fontFamily: FONTS.body, fontSize: 10, letterSpacing: 0.3, color: isActive ? COLORS.brand : COLORS.label, fontWeight: 700 }}>Zero</span>
                </button>
              );
            }

            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", border: "none", background: "none", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 46,
                    height: 30,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive ? COLORS.tint : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <Icon size={20} color={isActive ? COLORS.brand : COLORS.label} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span style={{ fontFamily: FONTS.body, fontSize: 10, letterSpacing: 0.3, color: isActive ? COLORS.brand : COLORS.label, fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
