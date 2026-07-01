const COLORS = {
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  clay: "#C2543F",
};
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "GBP" });
}
function formatDate(iso, opts) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, opts || { weekday: "short", month: "short", day: "numeric" });
}

export default function TravelTab({ shiftsWithTravel, totalTravelCost }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem 5rem" }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: COLORS.inkSoft, marginBottom: 10 }}>
        TOTAL SPENT ON TRAVEL
      </p>
      <div style={{ background: "white", border: `1px solid ${COLORS.paperDim}`, borderRadius: 8, padding: "1.25rem", marginBottom: 24 }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: 32, fontWeight: 600, color: totalTravelCost > 0 ? COLORS.clay : COLORS.ink, margin: 0 }}>
          {formatMoney(totalTravelCost)}
        </p>
        <p style={{ fontSize: 12, color: COLORS.inkSoft, margin: "6px 0 0" }}>across all logged shifts</p>
      </div>

      <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: COLORS.inkSoft, marginBottom: 10 }}>
        BY SHIFT
      </p>
      {shiftsWithTravel.length === 0 ? (
        <p style={{ fontSize: 14, color: COLORS.inkSoft, fontStyle: "italic" }}>
          No travel costs logged yet. Add a travel cost when you log a shift.
        </p>
      ) : (
        <div>
          {shiftsWithTravel.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", border: `1px solid ${COLORS.paperDim}`, borderRadius: 6, padding: "10px 14px", marginBottom: 7 }}>
              <span style={{ fontSize: 13, color: COLORS.ink }}>{formatDate(s.date)}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.clay }}>{formatMoney(s.travelCost)}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: COLORS.inkSoft, opacity: 0.6, marginTop: 20, lineHeight: 1.5 }}>
        Automatic distance and route lookup is planned for a future update.
      </p>
    </div>
  );
}
