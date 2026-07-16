import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { COLORS, FONTS, formatMoney } from "../theme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function getMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: `${year}-${pad(month + 1)}-${pad(d)}` });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateStr: null });
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

  const byDate = {};
  shifts.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
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

  const selectedShifts = byDate[selectedDate] || [];

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={goPrev} aria-label="Previous month" style={arrowStyle}>
          <ChevronLeft size={20} color={COLORS.navy} />
        </button>
        <p style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, letterSpacing: 2, color: COLORS.navy, margin: 0, textTransform: "uppercase" }}>
          {MONTH_NAMES[month]} {year}
        </p>
        <button onClick={goNext} aria-label="Next month" style={arrowStyle}>
          <ChevronRight size={20} color={COLORS.navy} />
        </button>
      </div>

      {/* Weekday letters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
        {DAY_LETTERS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, color: COLORS.label }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 22 }}>
        {cells.map((c, i) => {
          if (!c.day) return <div key={i} />;
          const dayShifts = byDate[c.dateStr];
          const hasShifts = dayShifts && dayShifts.length > 0;
          const isToday = c.dateStr === today;
          const isSelected = c.dateStr === selectedDate;
          const allPaid = hasShifts && dayShifts.every((s) => s.paid);
          const dotColor = !hasShifts ? null : allPaid ? "#c9c6be" : COLORS.navy;
          const boxed = isSelected || isToday;

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(c.dateStr)}
              style={{
                aspectRatio: "1",
                border: boxed ? `1.5px solid ${COLORS.ink}` : `1px solid ${COLORS.border}`,
                borderRadius: 2,
                background: COLORS.card,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: 2,
              }}
            >
              <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.navy }}>{c.day}</span>
              {dotColor && <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />}
            </button>
          );
        })}
      </div>

      {/* Selected day */}
      <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label, marginBottom: 12 }}>
        {new Date(selectedDate + "T00:00:00")
          .toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
          .toUpperCase()}
      </p>

      {selectedShifts.length === 0 ? (
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, fontStyle: "italic" }}>No shifts on this day.</p>
      ) : (
        selectedShifts.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: `1px solid ${COLORS.line}` }}>
            <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onEdit(s)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft }}>{s.start}—{s.end}</span>
                <span style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, color: COLORS.ink }}>{formatMoney(s.earnings)}</span>
              </div>
              {s.notes && <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.ink, margin: "5px 0 0" }}>{s.notes}</p>}
            </div>
            <button onClick={() => onDelete(s.id)} aria-label="Delete shift" style={{ border: "none", background: "none", padding: 0, color: COLORS.label, cursor: "pointer", display: "flex" }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const arrowStyle = {
  border: "none",
  background: "none",
  padding: 4,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};
