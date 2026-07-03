import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

const COLORS = {
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  sage: "#7C9070",
  navy: "#15203B",
};
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "GBP" });
}

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
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, dateStr: `${year}-${pad(month + 1)}-${pad(d)}` });
  }
  let trailDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: trailDay, inMonth: false, dateStr: null });
    trailDay++;
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={goPrev} aria-label="Previous month" style={navBtnStyle}>
          <ChevronLeft size={16} color={COLORS.ink} />
        </button>
        <p style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1, color: COLORS.ink, fontWeight: 600, margin: 0 }}>
          {MONTH_NAMES[month].toUpperCase()} {year}
        </p>
        <button onClick={goNext} aria-label="Next month" style={navBtnStyle}>
          <ChevronRight size={16} color={COLORS.ink} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
        {DAY_LETTERS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: FONT_MONO, fontSize: 9, color: COLORS.inkSoft, paddingBottom: 4 }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 18 }}>
        {cells.map((c, i) => {
          const dayShifts = c.dateStr ? byDate[c.dateStr] : null;
          const hasShifts = dayShifts && dayShifts.length > 0;
          const isToday = c.dateStr === today;
          const isSelected = c.dateStr === selectedDate;
          const isFuture = c.dateStr && c.dateStr >= today;
          const anyUnpaid = hasShifts && dayShifts.some((s) => !s.paid && !isFuture);
          const dotColor = !hasShifts ? null : isFuture ? COLORS.navy : anyUnpaid ? COLORS.amber : COLORS.sage;

          return (
            <button
              key={i}
              disabled={!c.inMonth}
              onClick={() => c.dateStr && setSelectedDate(c.dateStr)}
              style={{
                aspectRatio: "1",
                border: isSelected ? `2px solid ${COLORS.navy}` : isToday ? `1px solid ${COLORS.amber}` : "1px solid transparent",
                borderRadius: 5,
                background: c.inMonth ? "white" : "transparent",
                cursor: c.inMonth ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                padding: 2,
                opacity: c.inMonth ? 1 : 0.3,
              }}
            >
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inMonth ? COLORS.ink : COLORS.inkSoft }}>{c.day}</span>
              {dotColor && <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />}
            </button>
          );
        })}
      </div>

      <div>
        <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: COLORS.inkSoft, marginBottom: 10 }}>
          {new Date(selectedDate + "T00:00:00")
            .toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
            .toUpperCase()}
        </p>
        {selectedShifts.length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.inkSoft, fontStyle: "italic" }}>No shifts on this day.</p>
        ) : (
          selectedShifts.map((s) => (
            <div
              key={s.id}
              style={{ display: "flex", alignItems: "stretch", background: "white", border: `1px solid ${COLORS.paperDim}`, borderRadius: 4, marginBottom: 7, overflow: "hidden" }}
            >
              <div style={{ width: 4, background: s.paid ? COLORS.sage : COLORS.amber, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: "10px 12px", cursor: "pointer" }} onClick={() => onEdit(s)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.inkSoft }}>{s.start}&ndash;{s.end}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{formatMoney(s.earnings)}</span>
                </div>
                {s.notes && <p style={{ fontSize: 12, color: COLORS.inkSoft, fontStyle: "italic", margin: "3px 0 0" }}>{s.notes}</p>}
              </div>
              <button
                onClick={() => onDelete(s.id)}
                aria-label="Delete shift"
                style={{ border: "none", background: "none", padding: "0 11px", display: "flex", alignItems: "center", color: COLORS.inkSoft, cursor: "pointer" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const navBtnStyle = {
  border: `1px solid ${COLORS.paperDim}`,
  background: "white",
  borderRadius: 4,
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
