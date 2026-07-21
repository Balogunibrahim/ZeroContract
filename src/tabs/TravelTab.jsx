import { Car, Bus, Footprints } from "lucide-react";
import {
  COLORS,
  FONTS,
  ScreenLabel,
  DisplayHeader,
  cardStyle,
  formatMoney,
  formatDate,
} from "../theme";

const GOLD_TEXT = "#B77E17";

const MODES = {
  driving: { label: "Driving", tag: "Drive", Icon: Car, bg: COLORS.tint, color: COLORS.brand, bar: COLORS.brand },
  transit: { label: "Bus / train", tag: "Bus", Icon: Bus, bg: COLORS.goldTint, color: GOLD_TEXT, bar: COLORS.gold },
  walking: { label: "Walking", tag: "Walk", Icon: Footprints, bg: "var(--zc-subtle)", color: COLORS.label, bar: COLORS.label },
};

function pad(n) { return String(n).padStart(2, "0"); }
function mondayOf(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x;
}
function iso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export default function TravelTab({ shiftsWithTravel, totalTravelCost, totalEarnings, totalHours }) {
  const count = shiftsWithTravel.length;
  const perShift = count ? totalTravelCost / count : 0;
  const perHour = totalHours > 0 ? totalTravelCost / totalHours : 0;
  const sharePct = totalEarnings > 0 ? Math.round((totalTravelCost / totalEarnings) * 100) : null;

  // By mode
  const modeTotals = { driving: 0, transit: 0, walking: 0 };
  shiftsWithTravel.forEach((s) => {
    const m = s.travelMode && modeTotals[s.travelMode] !== undefined ? s.travelMode : "driving";
    modeTotals[m] += s.travelCost;
  });
  const maxMode = Math.max(modeTotals.driving, modeTotals.transit, modeTotals.walking, 0.01);

  // Last 6 weeks trend
  const thisMon = mondayOf(new Date());
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(thisMon);
    start.setDate(start.getDate() - i * 7);
    buckets.push({ key: iso(start), total: 0, label: `W${6 - i}` });
  }
  const bucketIndex = {};
  buckets.forEach((b, i) => (bucketIndex[b.key] = i));
  shiftsWithTravel.forEach((s) => {
    const k = iso(mondayOf(new Date(s.date + "T00:00:00")));
    if (bucketIndex[k] !== undefined) buckets[bucketIndex[k]].total += s.travelCost;
  });
  const maxWeek = Math.max(...buckets.map((b) => b.total), 0.01);
  const peakIdx = buckets.reduce((best, b, i) => (b.total > buckets[best].total ? i : best), 0);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem calc(6rem + env(safe-area-inset-bottom, 0px))" }}>
      <ScreenLabel>Getting there costs</ScreenLabel>
      <DisplayHeader>Travel</DisplayHeader>

      {/* Hero total */}
      <div style={{ background: "linear-gradient(150deg,#0B4835,#0B3D2E 72%,#092b21)", borderRadius: 24, padding: 22, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -30, top: -40, width: 160, height: 160, background: "radial-gradient(circle,rgba(224,160,43,.24),transparent 70%)", borderRadius: "50%" }} />
        <p style={{ fontSize: 11, color: "#9FD0BE", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, margin: 0, position: "relative" }}>Total spent on travel</p>
        <p style={{ fontFamily: FONTS.display, fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "4px 0 0", lineHeight: 1, position: "relative" }}>
          <span style={{ color: "#7FC9AC", fontSize: 25 }}>£</span>{totalTravelCost.toFixed(2)}
        </p>
        <div style={{ display: "flex", gap: 22, marginTop: 16, position: "relative", zIndex: 2, flexWrap: "wrap" }}>
          <HeroStat value={String(count)} label={count === 1 ? "shift" : "shifts"} />
          <HeroStat value={formatMoney(perShift)} label="per shift" />
          <HeroStat value={`−£${perHour.toFixed(2)}/h`} label="on real rate" gold />
        </div>
      </div>

      {/* Share of earnings */}
      {sharePct != null && totalTravelCost > 0 && (
        <div style={{ ...cardStyle, borderRadius: 20, padding: "16px 18px", marginTop: 14, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 60, height: 60, flex: "0 0 60px", borderRadius: "50%", background: `conic-gradient(${COLORS.gold} 0 ${Math.max(sharePct, 3)}%, ${COLORS.goldTint} ${Math.max(sharePct, 3)}% 100%)`, display: "grid", placeItems: "center" }}>
            <span style={{ width: 46, height: 46, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", fontFamily: FONTS.display, fontSize: 13, fontWeight: 700, color: GOLD_TEXT }}>{sharePct}%</span>
          </span>
          <div>
            <p style={{ fontSize: 12.5, color: COLORS.inkSoft, margin: 0 }}>Share of what you earned</p>
            <p style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, margin: "2px 0 0", lineHeight: 1.35, color: COLORS.ink }}>
              Travel took <span style={{ color: COLORS.brand }}>{sharePct}%</span> of your {formatMoney(totalEarnings)}
            </p>
          </div>
        </div>
      )}

      {count === 0 ? (
        <div style={{ ...cardStyle, borderRadius: 18, padding: "18px 20px", marginTop: 16 }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>
            No travel costs logged yet. Add a travel cost when you log a shift and it'll show up here.
          </p>
        </div>
      ) : (
        <>
          {/* Trend */}
          <SectionLabel>Last 6 weeks</SectionLabel>
          <div style={{ ...cardStyle, borderRadius: 20, padding: "18px 18px 14px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 96, marginTop: 4 }}>
              {buckets.map((b, i) => {
                const h = b.total > 0 ? Math.max(12, (b.total / maxWeek) * 100) : 6;
                const isPeak = i === peakIdx && b.total > 0;
                const bg = b.total === 0 ? "#E6EAE7" : isPeak ? "linear-gradient(180deg,#F2C46A,#E0A02B)" : "linear-gradient(180deg,#3FD39C,#0A7B57)";
                return (
                  <div key={b.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <div title={formatMoney(b.total)} style={{ width: "100%", height: `${h}%`, borderRadius: "6px 6px 3px 3px", background: bg }} />
                    <small style={{ fontSize: 10, color: COLORS.label }}>{b.label}</small>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By mode */}
          <SectionLabel>How you got there</SectionLabel>
          <div style={{ ...cardStyle, borderRadius: 20, padding: "6px 18px" }}>
            {["driving", "transit", "walking"].map((m, idx) => {
              const cfg = MODES[m];
              const Icon = cfg.Icon;
              const val = modeTotals[m];
              return (
                <div key={m} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 0", borderTop: idx === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                  <span style={{ width: 40, height: 40, flex: "0 0 40px", borderRadius: 12, background: cfg.bg, color: cfg.color, display: "grid", placeItems: "center" }}>
                    <Icon size={20} strokeWidth={1.9} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{cfg.label}</div>
                    <div style={{ height: 6, borderRadius: 4, background: "var(--zc-subtle)", marginTop: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: cfg.bar, width: `${Math.round((val / maxMode) * 100)}%` }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 15, color: val > 0 ? COLORS.ink : COLORS.label, whiteSpace: "nowrap" }}>{formatMoney(val)}</span>
                </div>
              );
            })}
          </div>

          {/* By shift */}
          <SectionLabel>By shift</SectionLabel>
          {shiftsWithTravel.map((s) => {
            const day = new Date(s.date + "T00:00:00").getDate();
            const cfg = MODES[s.travelMode] || null;
            const TagIcon = cfg ? cfg.Icon : null;
            const title = s.employer || s.workAddress || "Shift";
            return (
              <div key={s.id} style={{ ...cardStyle, borderRadius: 18, padding: "13px 15px", marginBottom: 10, display: "flex", alignItems: "center", gap: 13 }}>
                <span style={{ width: 44, height: 44, flex: "0 0 44px", borderRadius: 13, background: COLORS.tint, color: COLORS.brand, display: "grid", placeItems: "center", fontFamily: FONTS.display, fontWeight: 700, fontSize: 17 }}>{day}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
                    {cfg && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: COLORS.inkSoft, background: "var(--zc-subtle)", padding: "2px 7px", borderRadius: 6, flexShrink: 0 }}>
                        {TagIcon && <TagIcon size={11} strokeWidth={2} />}{cfg.tag}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 3 }}>
                    {formatDate(s.date, { weekday: "short", day: "numeric", month: "short" })}
                    {s.distanceKm ? ` · ${s.distanceKm} km each way` : ""}
                  </div>
                </div>
                <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: COLORS.ink, whiteSpace: "nowrap" }}>{formatMoney(s.travelCost)}</span>
              </div>
            );
          })}
        </>
      )}

      <div style={{ background: COLORS.tint, borderRadius: 16, padding: "14px 16px", marginTop: 16 }}>
        <p style={{ fontSize: 12.5, color: "#2C5E4C", lineHeight: 1.5, margin: 0 }}>
          Tip: add a workplace address when logging a shift and tap <b style={{ color: COLORS.brand }}>Estimate travel</b> to fill the cost automatically.
        </p>
      </div>
    </div>
  );
}

function HeroStat({ value, label, gold }) {
  return (
    <div style={{ fontSize: 11, color: "#BFE0D3" }}>
      <b style={{ display: "block", fontFamily: FONTS.display, fontSize: 15, color: gold ? "#F0C766" : "#fff", fontWeight: 600 }}>{value}</b>
      {label}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label, margin: "24px 4px 12px" }}>{children}</p>
  );
}
