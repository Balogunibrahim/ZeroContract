const COLORS = {
  navy: "#15203B",
  paper: "#F7F3EC",
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  clay: "#C2543F",
  offwhite: "#EDEAE2",
};
const FONT_DISPLAY = "'Roboto Slab', 'Georgia', serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "GBP" });
}
function formatDate(iso, opts) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, opts || { weekday: "short", month: "short", day: "numeric" });
}

export default function HomeTab({ firstName, totalEarned, totalUpcoming, totalUnpaid, nextPayday, taxEstimate, nextShift }) {
  return (
    <div>
      <div style={{ background: COLORS.navy, padding: "1.5rem 1.25rem 2.5rem" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, margin: 0 }}>ZERO CONTRACT</p>
          {firstName && (
            <p style={{ color: COLORS.offwhite, opacity: 0.55, fontFamily: FONT_BODY, fontSize: 13, margin: "2px 0 16px" }}>
              {firstName}'s ledger
            </p>
          )}
          <p style={{ color: COLORS.offwhite, opacity: 0.55, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, margin: "0 0 4px" }}>
            EARNED SO FAR
          </p>
          <p style={{ color: COLORS.offwhite, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, margin: 0, letterSpacing: -1, lineHeight: 1 }}>
            {formatMoney(totalEarned)}
          </p>

          {taxEstimate && (
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "14px 16px" }}>
              <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, margin: "0 0 8px" }}>
                EST. TAKE-HOME
              </p>
              <p style={{ color: COLORS.offwhite, fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600, margin: 0 }}>
                {formatMoney(taxEstimate.estimatedTakeHome)}
              </p>
              <p style={{ color: COLORS.offwhite, opacity: 0.5, fontSize: 11, margin: "6px 0 0" }}>
                after estimated tax and NI &mdash; see Money tab for details
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "-1.25rem auto 0", padding: "0 1.25rem" }}>
        <div style={{ background: "white", borderRadius: 6, boxShadow: "0 4px 18px rgba(21,32,59,0.18)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <StatCell label="UPCOMING" value={formatMoney(totalUpcoming)} color={COLORS.ink} />
          <StatCell label="UNPAID" value={formatMoney(totalUnpaid)} color={totalUnpaid > 0 ? COLORS.clay : COLORS.ink} border />
          <StatCell label="NEXT PAYDAY" value={nextPayday ? formatDate(nextPayday, { month: "short", day: "numeric" }) : "-"} color={COLORS.ink} border />
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem 5rem" }}>
        {nextShift ? (
          <div>
            <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: COLORS.inkSoft, marginBottom: 10 }}>NEXT UP</p>
            <div style={{ background: "white", border: `1px solid ${COLORS.paperDim}`, borderRadius: 6, padding: "14px 16px" }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: COLORS.ink }}>{formatDate(nextShift.date)}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: COLORS.inkSoft, fontFamily: FONT_MONO }}>
                {nextShift.start}&ndash;{nextShift.end} &middot; {formatMoney(nextShift.earnings)}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: COLORS.inkSoft, fontStyle: "italic" }}>No upcoming shifts. Tap + to add one.</p>
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value, color, border }) {
  return (
    <div style={{ padding: "14px 12px", borderLeft: border ? `1px solid ${COLORS.paperDim}` : "none", textAlign: "center" }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1, color: COLORS.inkSoft, margin: "0 0 5px" }}>{label}</p>
      <p style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 600, color, margin: 0 }}>{value}</p>
    </div>
  );
}
