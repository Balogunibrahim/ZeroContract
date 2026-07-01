import { useState } from "react";
import { Calendar, Clock, Trash2 } from "lucide-react";

const COLORS = {
  paper: "#F7F3EC",
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  sage: "#7C9070",
};
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "GBP" });
}
function formatDate(iso, opts) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, opts || { weekday: "short", month: "short", day: "numeric" });
}

export default function PlannerTab({ future, past, onEdit, onDelete, onTogglePaid }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem 5rem" }}>
      <Ledger
        title="Upcoming"
        icon={<Calendar size={14} color={COLORS.inkSoft} />}
        shifts={future}
        emptyText="No upcoming shifts. Tap + to schedule one."
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePaid={onTogglePaid}
      />
      <Ledger
        title="Past"
        icon={<Clock size={14} color={COLORS.inkSoft} />}
        shifts={[...past].reverse()}
        emptyText="No past shifts logged yet."
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePaid={onTogglePaid}
      />
    </div>
  );
}

function Ledger({ title, icon, shifts, emptyText, onEdit, onDelete, onTogglePaid }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${COLORS.paperDim}` }}>
        {icon}
        <h3 style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1.5, color: COLORS.inkSoft, fontWeight: 600 }}>
          {title.toUpperCase()}
        </h3>
      </div>
      {shifts.length === 0
        ? <p style={{ fontSize: 14, color: COLORS.inkSoft, fontStyle: "italic" }}>{emptyText}</p>
        : <div>{shifts.map((s) => <LedgerRow key={s.id} s={s} onEdit={onEdit} onDelete={onDelete} onTogglePaid={onTogglePaid} />)}</div>
      }
    </div>
  );
}

function LedgerRow({ s, onEdit, onDelete, onTogglePaid }) {
  const [tearing, setTearing] = useState(false);
  const handleToggle = (e) => {
    e.stopPropagation();
    setTearing(true);
    setTimeout(() => setTearing(false), 320);
    onTogglePaid(s);
  };
  const statusColor = s.paid ? COLORS.sage : COLORS.amber;
  return (
    <div style={{ display: "flex", alignItems: "stretch", background: "white", borderRadius: 4, marginBottom: 7, boxShadow: "0 1px 3px rgba(21,32,59,0.08)", overflow: "hidden" }}>
      <div style={{ width: 4, background: statusColor, flexShrink: 0 }} />
      <button
        onClick={handleToggle}
        aria-label={s.paid ? "Mark as unpaid" : "Mark as paid"}
        style={{
          border: "none",
          borderRight: `1px dashed ${COLORS.paperDim}`,
          background: "none",
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          transform: tearing ? "scale(0.85) rotate(-4deg)" : "scale(1)",
          transition: "transform 220ms cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 0.5, color: s.paid ? COLORS.sage : COLORS.inkSoft, fontWeight: 700 }}>
          {s.paid ? "PAID" : "MARK"}
        </span>
      </button>
      <div style={{ flex: 1, minWidth: 0, padding: "11px 14px", cursor: "pointer" }} onClick={() => onEdit(s)} role="button" tabIndex={0}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{formatDate(s.date)}</p>
          <p style={{ margin: 0, fontFamily: FONT_MONO, fontWeight: 600, fontSize: 15, color: COLORS.ink, whiteSpace: "nowrap" }}>
            {formatMoney(s.earnings)}
          </p>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkSoft, fontFamily: FONT_MONO }}>
          {s.start}&ndash;{s.end} &middot; {s.hours}h &middot; {formatMoney(s.rate)}/h
          {s.payday ? ` &middot; pays ${formatDate(s.payday, { month: "short", day: "numeric" })}` : ""}
        </p>
        {s.notes && <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.inkSoft, fontStyle: "italic" }}>{s.notes}</p>}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
        aria-label="Delete shift"
        style={{ border: "none", background: "none", padding: "0 12px", display: "flex", alignItems: "center", color: COLORS.inkSoft, cursor: "pointer" }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
