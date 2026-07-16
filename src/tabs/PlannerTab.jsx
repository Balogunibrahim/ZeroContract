import { useState } from "react";
import { Trash2 } from "lucide-react";
import CalendarView from "./CalendarView";
import {
  COLORS,
  FONTS,
  ScreenLabel,
  DisplayHeader,
  formatMoney,
  formatRate,
  formatDate,
} from "../theme";

export default function PlannerTab({ future, past, onEdit, onDelete, onTogglePaid }) {
  const [view, setView] = useState("list");
  const allShifts = [...future, ...past];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.75rem 1.25rem 6rem" }}>
      <ScreenLabel>Shift roster</ScreenLabel>
      <DisplayHeader>Planner</DisplayHeader>

      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <Toggle active={view === "list"} onClick={() => setView("list")}>List</Toggle>
        <Toggle active={view === "calendar"} onClick={() => setView("calendar")}>Calendar</Toggle>
      </div>

      {view === "calendar" ? (
        <CalendarView shifts={allShifts} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <>
          <Ledger title="Upcoming" shifts={future} emptyText="No upcoming shifts. Tap + to schedule one." onEdit={onEdit} onDelete={onDelete} onTogglePaid={onTogglePaid} />
          <Ledger title="Past" shifts={[...past].reverse()} emptyText="No past shifts logged yet." onEdit={onEdit} onDelete={onDelete} onTogglePaid={onTogglePaid} />
        </>
      )}
    </div>
  );
}

function Toggle({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 22px",
        borderRadius: 22,
        border: `1px solid ${COLORS.ink}`,
        background: active ? COLORS.black : "transparent",
        color: active ? "#fff" : COLORS.ink,
        fontFamily: FONTS.body,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Ledger({ title, shifts, emptyText, onEdit, onDelete, onTogglePaid }) {
  return (
    <div style={{ marginBottom: 34 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: 8,
          borderBottom: `1px solid ${COLORS.line}`,
          marginBottom: 4,
        }}
      >
        <span style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label }}>
          {title}
        </span>
        <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.label }}>{shifts.length}</span>
      </div>

      {shifts.length === 0 ? (
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, padding: "14px 0" }}>{emptyText}</p>
      ) : (
        shifts.map((s) => (
          <LedgerRow key={s.id} s={s} onEdit={onEdit} onDelete={onDelete} onTogglePaid={onTogglePaid} />
        ))
      )}
    </div>
  );
}

function LedgerRow({ s, onEdit, onDelete, onTogglePaid }) {
  const today = new Date().toISOString().slice(0, 10);
  const isPast = s.date < today;
  const isUnpaid = isPast && !s.paid;

  let meta = `${s.start}—${s.end} · ${s.hours.toFixed(1)}h · ${formatRate(s.rate)}/h`;
  if (s.payday) meta += ` · pays ${formatDate(s.payday, { weekday: "short", month: "short", day: "numeric" })}`;
  if (isUnpaid) meta += " · UNPAID";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "16px 0",
        borderBottom: `1px solid ${COLORS.line}`,
      }}
    >
      {/* PAID / MARK chip */}
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePaid(s); }}
        aria-label={s.paid ? "Mark as unpaid" : "Mark as paid"}
        style={{
          flexShrink: 0,
          padding: "8px 10px",
          border: `1px solid ${COLORS.ink}`,
          background: s.paid ? COLORS.black : "transparent",
          color: s.paid ? "#fff" : COLORS.ink,
          fontFamily: FONTS.body,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          cursor: "pointer",
        }}
      >
        {s.paid ? "PAID" : "MARK"}
      </button>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onEdit(s)} role="button" tabIndex={0}>
        <p style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 16, color: COLORS.ink, margin: 0 }}>
          {formatDate(s.date)}
        </p>
        <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.inkSoft, margin: "4px 0 0" }}>{meta}</p>
        {s.notes && (
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, margin: "5px 0 0" }}>{s.notes}</p>
        )}
      </div>

      {/* Earnings + delete */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        <p
          style={{
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 16,
            margin: 0,
            whiteSpace: "nowrap",
            color: s.paid ? COLORS.label : COLORS.ink,
            textDecoration: s.paid ? "line-through" : "none",
          }}
        >
          {formatMoney(s.earnings)}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
          aria-label="Delete shift"
          style={{ border: "none", background: "none", padding: 0, color: COLORS.label, cursor: "pointer", display: "flex" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
