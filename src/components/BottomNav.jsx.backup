import { Home, CalendarDays, Wallet, Car, User, Plus } from "lucide-react";
import { COLORS, FONTS } from "../theme";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "planner", label: "Planner", icon: CalendarDays },
  { id: "money", label: "Money", icon: Wallet },
  { id: "travel", label: "Travel", icon: Car },
  { id: "profile", label: "Profile", icon: User },
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
            bottom: 82,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: COLORS.black,
            border: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.28)",
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
            background: COLORS.bg,
            borderTop: `1px solid ${COLORS.line}`,
            padding: "8px 10px",
            paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
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
                  gap: 5,
                  padding: "8px 4px",
                  border: `1px solid ${isActive ? COLORS.ink : "transparent"}`,
                  borderRadius: 2,
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <Icon size={20} color={isActive ? COLORS.ink : COLORS.label} strokeWidth={isActive ? 2.2 : 1.8} />
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 9.5,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: isActive ? COLORS.ink : COLORS.label,
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
