import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { COLORS, FONTS, cardStyle, formatMoney } from "../theme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const GOLD_TEXT = "#B07C1C"; // readable gold for payday numbers

function pad(n) {
  return String(n).padStart(2, "0");
}

// Full 6-week grid, including greyed overflow days from adjacent months.
function getMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  // leading overflow (previous month)
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    cells.push({ day: d, dateStr: `${py}-${pad(pm + 1)}-${pad(d)}`, inMonth: false });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: `${year}-${pad(month + 1)}-${pad(d)}`, inMonth: true });
  }
  // trailing overflow (next month)
  let next = 1;
  while (cells.length % 7 !== 0) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    cells.push({ day: next, dateStr: `${ny}-${pad(nm + 1)}-${pad(next)}`, inMonth: false });
    next++;
  }
  return cells;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarView({ shifts, onEdit, onDelete }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [payoutOpen, setPayoutOpen] = useState(false);

  // shifts worked on a day, and payouts landing on a day
  const byDate = {};
  const byPayday = {};
  shifts.forEach((s) => {
    (byDate[s.date] = byDate[s.date] || []).push(s);
    if (s.payday) (byPayday[s.payday] = byPayday[s.payday] || []).push(s);
  });

  const cells = getMonthGrid(year, month);
  const today = todayISO();

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const goNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // month total (earnings from shifts worked this month)
  const monthPrefix = `${year}-${pad(month + 1)}`;
  const monthTotal = shifts
    .filter((s) => s.date.startsWith(monthPrefix))
    .reduce((sum, s) => sum + s.earnings, 0);

  const selectedShifts = byDate[selectedDate] || [];
  const selectedPayouts = byPayday[selectedDate] || [];

  return (
    <div>
      {/* Month + nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2
          style={{
            fontFamily: FONTS.display,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: COLORS.ink,
            margin: 0,
          }}
        >
          {MONTH_NAMES[month]} {year}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={goPrev} aria-label="Previous month" style={arrowStyle}>
            <ChevronLeft size={18} color={COLORS.ink} />
          </button>
          <button onClick={goNext} aria-label="Next month" style={arrowStyle}>
            <ChevronRight size={18} color={COLORS.ink} />
          </button>
        </div>
      </div>

      {/* Weekday letters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 7, marginBottom: 8 }}>
        {DAY_LETTERS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: FONTS.body, fontSize: 12, fontWeight: 500, color: COLORS.label }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 7, marginBottom: 22 }}>
        {cells.map((c, i) => {
          if (!c.inMonth) {
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  padding: "8px 0 0 9px",
                  fontFamily: FONTS.body,
                  fontSize: 14.5,
                  color: "#C4CDC7",
                }}
              >
                {c.day}
              </div>
            );
          }

          const workedTotal = (byDate[c.dateStr] || []).reduce((sum, s) => sum + s.earnings, 0);
          const paydayTotal = (byPayday[c.dateStr] || []).reduce((sum, s) => sum + s.earnings, 0);
          const isPayday = paydayTotal > 0;
          const amount = isPayday ? paydayTotal : workedTotal > 0 ? workedTotal : null;

          const isToday = c.dateStr === today;
          const isSelected = c.dateStr === selectedDate;
          const ringed = isSelected || isToday;

          let bg = COLORS.card;
          let numColor = COLORS.ink;
          let amtColor = COLORS.brand;
          if (isPayday) { bg = COLORS.goldTint; numColor = GOLD_TEXT; amtColor = GOLD_TEXT; }
          else if (workedTotal > 0) { bg = COLORS.tint; numColor = COLORS.deep; amtColor = COLORS.brand; }

          const border = ringed
            ? `2px solid ${COLORS.brand}`
            : bg === COLORS.card
            ? `1px solid ${COLORS.border}`
            : "1px solid transparent";

          return (
            <button
              key={i}
              onClick={() => { setSelectedDate(c.dateStr); setPayoutOpen(false); }}
              style={{
                position: "relative",
                aspectRatio: "1",
                boxSizing: "border-box",
                border,
                borderRadius: 16,
                background: bg,
                cursor: "pointer",
                padding: "8px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                overflow: "hidden",
              }}
            >
              <span style={{ fontFamily: FONTS.body, fontSize: 14.5, fontWeight: amount ? 600 : 500, color: numColor, lineHeight: 1 }}>
                {c.day}
              </span>
              {amount != null && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontFamily: FONTS.body,
                    fontSize: 12,
                    fontWeight: 700,
                    color: amtColor,
                  }}
                >
                  {formatMoney(amount)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Month earnings card */}
      <div
        style={{
          background: COLORS.deep,
          borderRadius: 22,
          padding: "22px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 26,
        }}
      >
        <span style={{ fontFamily: FONTS.body, fontSize: 14.5, color: "rgba(255,255,255,0.72)" }}>
          {MONTH_NAMES[month]} earnings so far
        </span>
        <span style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
          {formatMoney(monthTotal)}
        </span>
      </div>

      {/* Selected day detail */}
      <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.brand, marginBottom: 12 }}>
        {new Date(selectedDate + "T00:00:00")
          .toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
          .toUpperCase()}
      </p>

      {selectedPayouts.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setPayoutOpen((o) => !o)}
            aria-expanded={payoutOpen}
            style={{
              ...cardStyle,
              width: "100%",
              background: COLORS.goldTint,
              border: "1px solid #F0E2BE",
              borderRadius: payoutOpen ? "18px 18px 0 0" : 18,
              padding: "13px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ChevronDown
                size={17}
                color={GOLD_TEXT}
                style={{ transform: payoutOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s", flexShrink: 0 }}
              />
              <span style={{ fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600, color: GOLD_TEXT }}>
                Payday · {selectedPayouts.length} shift{selectedPayouts.length === 1 ? "" : "s"}
              </span>
            </span>
            <span style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 700, color: GOLD_TEXT, whiteSpace: "nowrap" }}>
              {formatMoney(selectedPayouts.reduce((sum, s) => sum + s.earnings, 0))}
            </span>
          </button>

          {payoutOpen && (
            <div
              style={{
                border: "1px solid #F0E2BE",
                borderTop: "none",
                borderRadius: "0 0 18px 18px",
                background: "#FEFBF3",
                overflow: "hidden",
              }}
            >
              {selectedPayouts.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => onEdit(s)}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderTop: idx === 0 ? "none" : `1px solid #F2E8CE`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.ink, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.employer || s.workAddress || s.notes || "Shift"}
                    </p>
                    <p style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, margin: "3px 0 0" }}>
                      Worked {new Date(s.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {s.hours.toFixed(1)}h
                    </p>
                  </div>
                  <span style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, color: GOLD_TEXT, whiteSpace: "nowrap" }}>
                    {formatMoney(s.earnings)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedShifts.length === 0 ? (
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, padding: "4px 0 8px" }}>
          No shifts on this day.
        </p>
      ) : (
        selectedShifts.map((s) => (
          <div
            key={s.id}
            style={{
              ...cardStyle,
              padding: "14px 16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onEdit(s)} role="button" tabIndex={0}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: COLORS.inkSoft }}>
                  {s.start}—{s.end} · {s.hours.toFixed(1)}h
                </span>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 17,
                    fontWeight: 700,
                    color: s.paid ? COLORS.label : COLORS.ink,
                    textDecoration: s.paid ? "line-through" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatMoney(s.earnings)}
                </span>
              </div>
              {s.employer && <p style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.brand, margin: "5px 0 0" }}>{s.employer}</p>}
              {s.notes && <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: "6px 0 0" }}>{s.notes}</p>}
            </div>
            <button
              onClick={() => onDelete(s.id)}
              aria-label="Delete shift"
              style={{ border: "none", background: "none", padding: 0, color: COLORS.label, cursor: "pointer", display: "flex", marginTop: 2 }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const arrowStyle = {
  width: 42,
  height: 42,
  borderRadius: 14,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.card,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
