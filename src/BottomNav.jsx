import { Home, CalendarDays, Wallet, Car, User, Plus } from "lucide-react";

const COLORS = {
  navy: "#15203B",
  paper: "#F7F3EC",
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  amberDeep: "#C97F1E",
};

const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

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
        <button
          onClick={onAddShift}
          aria-label="Add shift"
          style={{
            position: "absolute",
            right: 16,
            bottom: 64,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: COLORS.amber,
            border: `3px solid ${COLORS.paper}`,
            boxShadow: "0 4px 14px rgba(21,32,59,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Plus size={24} color={COLORS.navy} />
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            background: COLORS.paper,
            borderTop: `1px solid ${COLORS.paperDim}`,
            boxShadow: "0 -2px 10px rgba(21,32,59,0.08)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
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
                  gap: 3,
                  padding: "9px 4px 8px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <Icon size={19} color={isActive ? COLORS.amberDeep : COLORS.inkSoft} strokeWidth={isActive ? 2.4 : 1.8} />
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    letterSpacing: 0.5,
                    color: isActive ? COLORS.ink : COLORS.inkSoft,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {t.label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
