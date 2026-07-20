import { Home, List, Wallet, Car, Settings, Plus } from "lucide-react";
import { COLORS, FONTS } from "../theme";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "planner", label: "Shifts", icon: List },
  { id: "money", label: "Money", icon: Wallet },
  { id: "travel", label: "Travel", icon: Car },
  { id: "profile", label: "Settings", icon: Settings },
];

export default function BottomNav({ active, onChange, onAddShift }) {
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40 }}>
      <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
        {/* Floating add button */}
        <button
          onClick={onAddShift}
          aria-label="Add shift"
          style={{
            position: "absolute",
            right: 18,
            bottom: 84,
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "linear-gradient(135deg,#0A7B57,#0B3D2E)",
            border: "none",
            boxShadow: "0 12px 24px -8px rgba(10,123,87,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Plus size={26} color="#ffffff" />
        </button>

        {/* Tab bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            background: "rgba(255,255,255,0.92)",
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
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 0",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
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
                  <Icon
                    size={20}
                    color={isActive ? COLORS.brand : COLORS.label}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </div>
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 10,
                    letterSpacing: 0.3,
                    color: isActive ? COLORS.brand : COLORS.label,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
