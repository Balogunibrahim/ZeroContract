import {
  COLORS,
  FONTS,
  cardStyle,
  formatMoney,
  formatRate,
  formatDate,
  daysUntil,
  Ring,
} from "../theme";
import WeatherCard from "../components/WeatherCard";

export default function HomeTab({
  firstName,
  homeAddress,
  totalEarned,
  upcomingCount,
  totalUnpaid,
  nextPayday,
  taxEstimate,
  nextShift,
  onSeeBreakdown,
}) {
  const takeHome = taxEstimate ? taxEstimate.estimatedTakeHome : null;
  const takePct =
    taxEstimate && totalEarned > 0
      ? Math.round((takeHome / totalEarned) * 100)
      : null;

  const pdDays = daysUntil(nextPayday);
  // Cosmetic ring fill: how close payday is, on a rough 30-day view
  const pdFill =
    pdDays == null ? 0 : Math.max(6, Math.min(100, (1 - pdDays / 30) * 100));

  const shiftDay = nextShift
    ? new Date(nextShift.date + "T00:00:00").getDate()
    : null;

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "1.5rem 1.25rem calc(6rem + env(safe-area-inset-bottom, 0px))",
        textAlign: "left",
      }}
    >
      <p style={{ ...label, marginBottom: 2 }}>Welcome back</p>
      <h2
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "-0.02em",
          color: COLORS.ink,
          margin: "0 0 16px",
        }}
      >
        {firstName ? `Hi, ${firstName}` : "Your ledger"}
      </h2>

      {/* Today's weather + outfit tip */}
      <WeatherCard homeAddress={homeAddress} />

      {/* Earnings hero */}
      <div
        style={{
          background: "linear-gradient(150deg,#0B4835,#0B3D2E 70%,#092b21)",
          borderRadius: 24,
          padding: "24px 22px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 18px 38px -18px rgba(11,61,46,.6)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -50,
            width: 180,
            height: 180,
            background:
              "radial-gradient(circle,rgba(224,160,43,.22),transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <p style={{ ...label, color: "#9FD0BE", position: "relative" }}>
          Earned so far
        </p>
        <p
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: "clamp(40px, 12vw, 52px)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            margin: "4px 0 0",
            position: "relative",
          }}
        >
          {formatMoney(totalEarned)}
        </p>
        <div
          style={{
            display: "flex",
            gap: 22,
            marginTop: 18,
            position: "relative",
          }}
        >
          <HeroStat label="Upcoming" value={String(upcomingCount)} />
          <HeroStat label="Unpaid" value={formatMoney(totalUnpaid)} />
          {takeHome != null && (
            <HeroStat label="Take home" value={formatMoney(takeHome)} />
          )}
        </div>
      </div>

      {/* Payday countdown */}
      {nextPayday && (
        <div
          style={{
            marginTop: 14,
            background: "linear-gradient(135deg,#FDF6E6,#FBF1DC)",
            border: "1px solid #EFDCAF",
            borderRadius: 20,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Ring
            percent={pdFill}
            size={58}
            thickness={7}
            color={COLORS.gold}
            track="#F1E2BC"
          >
            <div style={{ textAlign: "center", lineHeight: 1 }}>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#B77E17",
                }}
              >
                {pdDays != null ? pdDays : "—"}
              </div>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#C9A24B",
                }}
              >
                DAYS
              </div>
            </div>
          </Ring>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#B08A2E",
                margin: 0,
              }}
            >
              Next payday
            </p>
            <p
              style={{
                fontFamily: FONTS.display,
                fontSize: 17,
                fontWeight: 700,
                color: "#5C4611",
                margin: "3px 0 0",
              }}
            >
              {formatDate(nextPayday, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p style={{ fontSize: 12, color: "#9A7A28", margin: "3px 0 0" }}>
              <b style={{ fontFamily: FONTS.display, color: "#7A5D16" }}>
                {formatMoney(totalUnpaid)}
              </b>{" "}
              unpaid so far
            </p>
          </div>
        </div>
      )}

      {/* Take-home after tax */}
      {taxEstimate && (
        <div
          style={{
            ...cardStyle,
            borderRadius: 20,
            marginTop: 14,
            padding: "15px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Ring percent={takePct || 0} size={50} thickness={6}>
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.brand,
              }}
            >
              {takePct != null ? takePct + "%" : "—"}
            </span>
          </Ring>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: COLORS.inkSoft, margin: 0 }}>
              Estimated take home after tax
            </p>
            <p
              style={{
                fontFamily: FONTS.display,
                fontSize: 19,
                fontWeight: 700,
                color: COLORS.ink,
                margin: "2px 0 0",
              }}
            >
              <s
                style={{
                  color: COLORS.label,
                  fontWeight: 500,
                  fontSize: 14,
                  marginRight: 6,
                }}
              >
                {formatMoney(totalEarned)}
              </s>
              {formatMoney(takeHome)}
            </p>
          </div>
          <button
            onClick={onSeeBreakdown}
            style={{
              border: "none",
              background: COLORS.tint,
              color: COLORS.brand,
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 12,
              borderRadius: 11,
              padding: "9px 13px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Breakdown
          </button>
        </div>
      )}

      {/* Next up */}
      <p style={{ ...label, margin: "24px 0 12px" }}>Next up</p>
      {nextShift ? (
        <div
          style={{
            ...cardStyle,
            padding: "15px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              flex: "0 0 46px",
              borderRadius: 14,
              background: COLORS.tint,
              color: COLORS.brand,
              display: "grid",
              placeItems: "center",
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {shiftDay}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 14.5,
                color: COLORS.ink,
                margin: 0,
              }}
            >
              {formatDate(nextShift.date)}
            </p>
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: 12.5,
                color: COLORS.inkSoft,
                margin: "3px 0 0",
              }}
            >
              {nextShift.start} &rarr; {nextShift.end} &middot;{" "}
              {nextShift.hours.toFixed(1)}h &middot; {formatRate(nextShift.rate)}/h
            </p>
            {nextShift.notes && (
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 13,
                  color: COLORS.ink,
                  margin: "5px 0 0",
                }}
              >
                {nextShift.notes}
              </p>
            )}
          </div>
          <p
            style={{
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 17,
              color: COLORS.ink,
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            {formatMoney(nextShift.earnings)}
          </p>
        </div>
      ) : (
        <div
          style={{
            ...cardStyle,
            padding: "20px 18px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: COLORS.inkSoft,
              margin: 0,
            }}
          >
            No upcoming shifts. Tap + to add one.
          </p>
        </div>
      )}
    </div>
  );
}

const label = {
  fontFamily: FONTS.body,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: COLORS.label,
  margin: 0,
};

function HeroStat({ label: l, value }) {
  return (
    <div>
      <p
        style={{
          fontFamily: FONTS.display,
          fontSize: 17,
          fontWeight: 600,
          color: "#fff",
          margin: "0 0 2px",
        }}
      >
        {value}
      </p>
      <p style={{ fontFamily: FONTS.body, fontSize: 11.5, color: "#BFE0D3", margin: 0 }}>
        {l}
      </p>
    </div>
  );
}
