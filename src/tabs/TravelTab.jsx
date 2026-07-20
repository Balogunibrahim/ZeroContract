import { Car } from "lucide-react";
import {
  COLORS,
  FONTS,
  ScreenLabel,
  DisplayHeader,
  cardStyle,
  formatMoney,
  formatDate,
} from "../theme";

export default function TravelTab({ shiftsWithTravel, totalTravelCost }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.75rem 1.25rem 6rem" }}>
      <ScreenLabel>Getting there costs</ScreenLabel>
      <DisplayHeader>Travel</DisplayHeader>

      <p style={{ ...labelSmall, marginBottom: 12 }}>Total spent on travel</p>
      <div
        style={{
          ...cardStyle,
          borderRadius: 24,
          padding: "22px 22px",
          marginBottom: 26,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            flex: "0 0 54px",
            borderRadius: 16,
            background: COLORS.goldTint,
            color: COLORS.gold,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Car size={26} strokeWidth={1.9} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: "clamp(34px, 10vw, 44px)",
              letterSpacing: "-0.02em",
              color: COLORS.ink,
              margin: 0,
              lineHeight: 1,
            }}
          >
            {formatMoney(totalTravelCost)}
          </p>
          <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, margin: "8px 0 0" }}>
            What your shifts have cost you to get to.
          </p>
        </div>
      </div>

      <p style={{ ...labelSmall, marginBottom: 12 }}>By shift</p>

      {shiftsWithTravel.length === 0 ? (
        <div style={{ ...cardStyle, borderRadius: 18, padding: "18px 20px" }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>
            No travel costs logged yet. Add a travel cost when you log a shift.
          </p>
        </div>
      ) : (
        shiftsWithTravel.map((s) => {
          const day = new Date(s.date + "T00:00:00").getDate();
          return (
            <div
              key={s.id}
              style={{
                ...cardStyle,
                borderRadius: 18,
                padding: "14px 16px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  flex: "0 0 44px",
                  borderRadius: 14,
                  background: COLORS.tint,
                  color: COLORS.brand,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: FONTS.display,
                  fontWeight: 700,
                  fontSize: 17,
                }}
              >
                {day}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: FONTS.body, fontSize: 14.5, fontWeight: 600, color: COLORS.ink, margin: 0 }}>
                  {formatDate(s.date)}
                </p>
                {s.notes && (
                  <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.inkSoft, margin: "3px 0 0" }}>
                    {s.notes}
                  </p>
                )}
              </div>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 16,
                  fontWeight: 700,
                  color: COLORS.ink,
                  whiteSpace: "nowrap",
                }}
              >
                {formatMoney(s.travelCost)}
              </span>
            </div>
          );
        })
      )}

      <p style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.label, marginTop: 18 }}>
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
