import {
  COLORS,
  FONTS,
  ScreenLabel,
  DisplayHeader,
  formatMoney,
  formatRate,
  formatDate,
} from "../theme";

export default function HomeTab({
  firstName,
  totalEarned,
  upcomingCount,
  totalUnpaid,
  nextPayday,
  taxEstimate,
  nextShift,
  onSeeBreakdown,
}) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.75rem 1.25rem 6rem" }}>
      <ScreenLabel>
        Zero Contract{firstName ? ` · ${firstName}'s ledger` : ""}
      </ScreenLabel>

      <DisplayHeader>Earned</DisplayHeader>

      <p style={{ ...labelSmall, marginBottom: 6 }}>Earned so far</p>
      <p style={amountStyle}>{formatMoney(totalEarned)}</p>

      {taxEstimate && (
        <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.inkSoft, margin: "10px 0 0" }}>
          Est. take home {formatMoney(taxEstimate.estimatedTakeHome)} &nbsp;&mdash;&nbsp;
          <button onClick={onSeeBreakdown} style={linkStyle}>see breakdown</button>
        </p>
      )}

      {/* Three-up stat strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: `1px solid ${COLORS.line}`,
          borderBottom: `1px solid ${COLORS.line}`,
          margin: "1.75rem 0 0",
        }}
      >
        <Stat label="Upcoming" value={String(upcomingCount)} />
        <Stat label="Unpaid" value={formatMoney(totalUnpaid)} border />
        <Stat
          label="Next payday"
          value={nextPayday ? formatDate(nextPayday, { weekday: "short", month: "short", day: "numeric" }) : "—"}
          border
        />
      </div>

      {/* Next up */}
      <p style={{ ...labelSmall, margin: "2rem 0 12px" }}>Next up</p>
      {nextShift ? (
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 2, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <p style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 18, color: COLORS.ink, margin: 0 }}>
              {formatDate(nextShift.date)}
            </p>
            <p style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 18, color: COLORS.ink, margin: 0, whiteSpace: "nowrap" }}>
              {formatMoney(nextShift.earnings)}
            </p>
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, margin: "8px 0 0" }}>
            {nextShift.start} &rarr; {nextShift.end} &middot; {nextShift.hours.toFixed(1)}h &middot; {formatRate(nextShift.rate)}/h
          </p>
          {nextShift.notes && (
            <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, margin: "6px 0 0" }}>
              {nextShift.notes}
            </p>
          )}
        </div>
      ) : (
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft }}>
          No upcoming shifts. Tap + to add one.
        </p>
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
};

const amountStyle = {
  fontFamily: FONTS.display,
  fontWeight: 400,
  fontSize: "clamp(44px, 13vw, 56px)",
  lineHeight: 1,
  letterSpacing: "-0.02em",
  color: COLORS.ink,
  margin: 0,
};

const linkStyle = {
  border: "none",
  background: "none",
  padding: 0,
  color: COLORS.inkSoft,
  textDecoration: "underline",
  cursor: "pointer",
  fontFamily: FONTS.body,
  fontSize: 13.5,
};

function Stat({ label, value, border }) {
  return (
    <div style={{ padding: "14px 4px 16px", borderLeft: border ? `1px solid ${COLORS.line}` : "none" }}>
      <p style={{ ...labelSmall, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, color: COLORS.ink, margin: 0 }}>
        {value}
      </p>
    </div>
  );
}
