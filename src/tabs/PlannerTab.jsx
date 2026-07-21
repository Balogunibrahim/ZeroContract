import { useState, useMemo } from "react";
import { Trash2, Search, ArrowUpDown, X, FileText } from "lucide-react";
import CalendarView from "./CalendarView";
import TimesheetExport from "../components/TimesheetExport";
import {
  COLORS,
  FONTS,
  ScreenLabel,
  DisplayHeader,
  formatMoney,
  formatRate,
  formatDate,
} from "../theme";

const TODAY = () => new Date().toISOString().slice(0, 10);

const FILTERS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "unpaid", label: "Unpaid" },
  { id: "paid", label: "Paid" },
];

const SORTS = [
  { id: "date", label: "Date" },
  { id: "earnings", label: "Earnings" },
  { id: "hours", label: "Hours" },
];

const GROUPS = [
  { id: "none", label: "Flat" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

// ISO date -> Monday of that week (ISO string)
function weekStartISO(iso) {
  const d = new Date(iso + "T00:00:00");
  const day = (d.getDay() + 6) % 7; // Mon = 0
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function weekLabel(iso) {
  const start = new Date(iso + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function monthLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function PlannerTab({ future, past, onEdit, onDelete, onTogglePaid, employers, profile }) {
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [group, setGroup] = useState("none");
  const [showTimesheet, setShowTimesheet] = useState(false);

  const allShifts = useMemo(() => [...future, ...past], [future, past]);
  const today = TODAY();

  // Filter + search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allShifts.filter((s) => {
      const isPast = s.date < today;
      if (filter === "upcoming" && isPast) return false;
      if (filter === "paid" && !s.paid) return false;
      if (filter === "unpaid" && !(isPast && !s.paid)) return false;
      if (q) {
        const hay = `${s.employer || ""} ${s.notes || ""} ${formatDate(s.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} ${s.date}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allShifts, filter, query, today]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp;
      if (sort === "earnings") cmp = a.earnings - b.earnings;
      else if (sort === "hours") cmp = a.hours - b.hours;
      else cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sort, sortDir]);

  // Totals for what's shown
  const totals = useMemo(() => {
    let hours = 0, earned = 0, unpaid = 0;
    for (const s of filtered) {
      hours += s.hours;
      earned += s.earnings;
      if (s.date < today && !s.paid) unpaid += s.earnings;
    }
    return { count: filtered.length, hours, earned, unpaid };
  }, [filtered, today]);

  // Grouping
  const groups = useMemo(() => {
    if (group === "none") return [{ key: "all", label: null, shifts: sorted }];
    const map = new Map();
    for (const s of sorted) {
      const key = group === "week" ? weekStartISO(s.date) : s.date.slice(0, 7) + "-01";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    const keys = [...map.keys()].sort((a, b) => (sortDir === "asc" ? (a < b ? -1 : 1) : a < b ? 1 : -1));
    return keys.map((key) => ({
      key,
      label: group === "week" ? weekLabel(key) : monthLabel(key),
      shifts: map.get(key),
      subtotal: map.get(key).reduce((sum, s) => sum + s.earnings, 0),
      subhours: map.get(key).reduce((sum, s) => sum + s.hours, 0),
    }));
  }, [sorted, group, sortDir]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem calc(6rem + env(safe-area-inset-bottom, 0px))" }}>
      <ScreenLabel>Shift roster</ScreenLabel>
      <DisplayHeader>Shifts</DisplayHeader>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center" }}>
        <Toggle active={view === "list"} onClick={() => setView("list")}>List</Toggle>
        <Toggle active={view === "calendar"} onClick={() => setView("calendar")}>Calendar</Toggle>
        <button
          onClick={() => setShowTimesheet(true)}
          style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 22, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.brand, fontFamily: FONTS.body, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
        >
          <FileText size={14} /> Timesheet
        </button>
      </div>

      {showTimesheet && (
        <TimesheetExport
          shifts={allShifts}
          employers={employers || []}
          profile={profile}
          onClose={() => setShowTimesheet(false)}
        />
      )}

      {view === "calendar" ? (
        <CalendarView shifts={allShifts} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <>
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: "11px 14px",
              marginBottom: 12,
            }}
          >
            <Search size={17} color={COLORS.label} strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes or dates"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: FONTS.body,
                fontSize: 14.5,
                color: COLORS.ink,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", color: COLORS.label }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>

          {/* Sort + group row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort by"
                style={selectStyle}
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>Sort: {s.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                aria-label="Toggle sort direction"
                title={sortDir === "asc" ? "Ascending" : "Descending"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 11px",
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.card,
                  color: COLORS.inkSoft,
                  fontFamily: FONTS.body,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ArrowUpDown size={14} />
                {sortDir === "asc" ? "Asc" : "Desc"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              {GROUPS.map((g) => (
                <MiniChip key={g.id} active={group === g.id} onClick={() => setGroup(g.id)}>
                  {g.label}
                </MiniChip>
              ))}
            </div>
          </div>

          {/* Summary totals */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <Stat label={`${totals.count} shift${totals.count === 1 ? "" : "s"}`} value={`${totals.hours.toFixed(1)}h`} />
            <Stat label="Earned" value={formatMoney(totals.earned)} accent={COLORS.brand} />
            <Stat label="Unpaid" value={formatMoney(totals.unpaid)} accent={totals.unpaid > 0 ? COLORS.danger : COLORS.label} />
          </div>

          {/* List */}
          {sorted.length === 0 ? (
            <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, padding: "22px 0", textAlign: "center" }}>
              {query || filter !== "all" ? "No shifts match your search or filter." : "No shifts yet. Tap + to schedule one."}
            </p>
          ) : (
            groups.map((grp) => (
              <div key={grp.key} style={{ marginBottom: grp.label ? 26 : 0 }}>
                {grp.label && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      paddingBottom: 8,
                      marginBottom: 2,
                      borderBottom: `1px solid ${COLORS.line}`,
                    }}
                  >
                    <span style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: COLORS.brand }}>
                      {grp.label}
                    </span>
                    <span style={{ fontFamily: FONTS.body, fontSize: 12, color: COLORS.label }}>
                      {grp.subhours.toFixed(1)}h · {formatMoney(grp.subtotal)}
                    </span>
                  </div>
                )}
                {grp.shifts.map((s) => (
                  <LedgerRow key={s.id} s={s} onEdit={onEdit} onDelete={onDelete} onTogglePaid={onTogglePaid} />
                ))}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

const selectStyle = {
  padding: "8px 11px",
  borderRadius: 12,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.card,
  color: COLORS.ink,
  fontFamily: FONTS.body,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
};

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

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 20,
        border: `1px solid ${active ? COLORS.brand : COLORS.border}`,
        background: active ? COLORS.tint : COLORS.card,
        color: active ? COLORS.deep : COLORS.inkSoft,
        fontFamily: FONTS.body,
        fontSize: 12.5,
        fontWeight: active ? 700 : 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function MiniChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 12,
        border: `1px solid ${active ? COLORS.brand : COLORS.border}`,
        background: active ? COLORS.brand : COLORS.card,
        color: active ? "#fff" : COLORS.inkSoft,
        fontFamily: FONTS.body,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "13px 14px",
      }}
    >
      <p
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.1,
          color: accent || COLORS.ink,
          margin: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </p>
      <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 0.4, color: COLORS.label, margin: "5px 0 0", textTransform: "uppercase" }}>
        {label}
      </p>
    </div>
  );
}

function LedgerRow({ s, onEdit, onDelete, onTogglePaid }) {
  const today = TODAY();
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
          borderRadius: 10,
          border: `1px solid ${s.paid ? COLORS.brand : COLORS.ink}`,
          background: s.paid ? COLORS.brand : "transparent",
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
        {s.employer && (
          <p style={{ fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 600, color: COLORS.brand, margin: "3px 0 0" }}>{s.employer}</p>
        )}
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
          style={{ border: "none", background: "none", padding: 8, margin: -8, color: COLORS.label, cursor: "pointer", display: "flex" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
