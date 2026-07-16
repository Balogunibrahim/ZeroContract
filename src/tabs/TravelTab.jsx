import { COLORS, FONTS, ScreenLabel, DisplayHeader, formatMoney, formatDate } from "../theme";

export default function TravelTab({ shiftsWithTravel, totalTravelCost }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.75rem 1.25rem 6rem" }}>
      <ScreenLabel>Getting there costs</ScreenLabel>
      <DisplayHeader>Travel</DisplayHeader>

      <p style={{ ...labelSmall, marginBottom: 12 }}>Total spent on travel</p>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 2, padding: "22px 22px 20px", marginBottom: 30 }}>
        <p style={{ fontFamily: FONTS.display, fontWeight: 400, fontSize: "clamp(38px, 11vw, 48px)", letterSpacing: "-0.02em", color: COLORS.ink, margin: 0, lineHeight: 1 }}>
          {formatMoney(totalTravelCost)}
        </p>
        <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.inkSoft, margin: "12px 0 0" }}>
          What your shifts have cost you to get to.
        </p>
      </div>

      <p style={{ ...labelSmall, paddingBottom: 8, borderBottom: `1px solid ${COLORS.line}`, marginBottom: 0 }}>By shift</p>

      {shiftsWithTravel.length === 0 ? (
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, padding: "16px 0" }}>
          No travel costs logged yet. Add a travel cost when you log a shift.
        </p>
      ) : (
        shiftsWithTravel.map((s) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "16px 0", borderBottom: `1px solid ${COLORS.line}` }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink, margin: 0 }}>{formatDate(s.date)}</p>
              {s.notes && <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, margin: "3px 0 0" }}>{s.notes}</p>}
            </div>
            <span style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, color: COLORS.ink, whiteSpace: "nowrap" }}>{formatMoney(s.travelCost)}</span>
          </div>
        ))
      )}

      <p style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.label, marginTop: 20 }}>
        Automatic distance lookup coming soon.
      </p>
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
