import { useState, useMemo } from "react";
import { X, Printer, Download } from "lucide-react";
import { COLORS, FONTS, formatMoney } from "../theme";

function fmtDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

export default function TimesheetExport({ shifts, employers, profile, onClose }) {
  const names = (employers || []).map((e) => e.name);
  const [employer, setEmployer] = useState(names[0] || "");
  const [period, setPeriod] = useState("all");
  const [unpaidOnly, setUnpaidOnly] = useState(false);

  const workerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Worker";

  const periodLabel = useMemo(() => {
    const now = new Date();
    if (period === "thisMonth") return now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (period === "lastMonth") return new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    return "All shifts";
  }, [period]);

  const rows = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return shifts
      .filter((s) => {
        if (employer && s.employer !== employer) return false;
        if (unpaidOnly && s.paid) return false;
        if (period !== "all") {
          const d = new Date(s.date + "T00:00:00");
          if (period === "thisMonth" && !(d.getFullYear() === y && d.getMonth() === m)) return false;
          if (period === "lastMonth") {
            const lm = new Date(y, m - 1, 1);
            if (!(d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth())) return false;
          }
        }
        return true;
      })
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [shifts, employer, period, unpaidOnly]);

  const totalHours = rows.reduce((s, x) => s + x.hours, 0);
  const totalAmount = rows.reduce((s, x) => s + x.earnings, 0);

  const buildHTML = () => {
    const body = rows
      .map(
        (s) => `<tr>
      <td>${escapeHtml(fmtDate(s.date))}</td>
      <td>${escapeHtml(s.start || "")}–${escapeHtml(s.end || "")}</td>
      <td class="num">${s.hours.toFixed(2)}</td>
      <td class="num">£${Number(s.rate).toFixed(2)}</td>
      <td class="num">${s.paid ? "Paid" : "Unpaid"}</td>
      <td class="num">£${s.earnings.toFixed(2)}</td>
    </tr>`
      )
      .join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Timesheet — ${escapeHtml(employer)}</title>
    <style>
      *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#16211C;margin:0;padding:32px}
      .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0A7B57;padding-bottom:16px;margin-bottom:20px}
      .brand{font-size:20px;font-weight:700;color:#0B3D2E} .brand span{color:#0A7B57}
      h1{font-size:22px;margin:2px 0 0} .meta{font-size:13px;color:#5E6B63;line-height:1.7;margin-bottom:18px}
      .meta b{color:#16211C}
      table{width:100%;border-collapse:collapse;font-size:13px} th{text-align:left;color:#5E6B63;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #E5EAE6;padding:8px 6px}
      td{padding:9px 6px;border-bottom:1px solid #EEF2EF} .num{text-align:right}
      tfoot td{font-weight:700;border-top:2px solid #16211C;border-bottom:none;padding-top:12px}
      .total{color:#0A7B57;font-size:16px}
      .note{margin-top:22px;font-size:11.5px;color:#93A099;line-height:1.5}
      @media print{body{padding:0}}
    </style></head><body>
      <div class="head">
        <div><div class="brand">Zero<span>Contract</span></div><h1>Timesheet</h1></div>
        <div style="text-align:right;font-size:12px;color:#5E6B63">Generated ${escapeHtml(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}</div>
      </div>
      <div class="meta">
        <div><b>Worker:</b> ${escapeHtml(workerName)}</div>
        <div><b>Employer:</b> ${escapeHtml(employer || "—")}</div>
        <div><b>Period:</b> ${escapeHtml(periodLabel)}${unpaidOnly ? " · unpaid only" : ""}</div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Time</th><th class="num">Hours</th><th class="num">Rate</th><th class="num">Status</th><th class="num">Amount</th></tr></thead>
        <tbody>${body || '<tr><td colspan="6" style="color:#93A099;padding:16px 6px">No shifts match this selection.</td></tr>'}</tbody>
        <tfoot><tr><td colspan="2">Total</td><td class="num">${totalHours.toFixed(2)}</td><td></td><td></td><td class="num total">£${totalAmount.toFixed(2)}</td></tr></tfoot>
      </table>
      <p class="note">${rows.length} shift${rows.length === 1 ? "" : "s"}. Amounts are gross (before tax). Generated with ZeroContract.</p>
    </body></html>`;
  };

  const printPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(buildHTML());
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const downloadCSV = () => {
    const header = ["Date", "Start", "End", "Hours", "Rate", "Status", "Amount"];
    const lines = rows.map((s) => [s.date, s.start || "", s.end || "", s.hours.toFixed(2), Number(s.rate).toFixed(2), s.paid ? "Paid" : "Unpaid", s.earnings.toFixed(2)].join(","));
    lines.push(["", "", "", totalHours.toFixed(2), "", "Total", totalAmount.toFixed(2)].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet-${(employer || "shifts").replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const noEmployers = names.length === 0;

  return (
    <div style={overlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.bg, borderRadius: 24, maxWidth: 460, width: "100%", padding: "1.5rem", boxShadow: "0 30px 60px -22px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <p style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.ink, margin: 0 }}>Export timesheet</p>
          <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 11, border: `1px solid ${COLORS.border}`, background: "#fff", display: "grid", placeItems: "center", color: COLORS.inkSoft, cursor: "pointer" }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "0 0 18px", lineHeight: 1.5 }}>Pick an employer and period, then save a PDF or CSV to claim your pay.</p>

        {noEmployers ? (
          <div style={{ ...card, padding: "16px 18px" }}>
            <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>Add an employer to a shift first, then you can export a timesheet for them.</p>
          </div>
        ) : (
          <>
            <label style={flabel}>Employer</label>
            <select aria-label="Employer" value={employer} onChange={(e) => setEmployer(e.target.value)} style={{ ...input, appearance: "none", cursor: "pointer", marginBottom: 14 }}>
              {names.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            <label style={flabel}>Period</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["all", "All time"], ["thisMonth", "This month"], ["lastMonth", "Last month"]].map(([id, lbl]) => (
                <button key={id} onClick={() => setPeriod(id)} style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: `1px solid ${period === id ? COLORS.brand : COLORS.border}`, background: period === id ? COLORS.tint : "#fff", color: period === id ? COLORS.deep : COLORS.inkSoft, fontSize: 12.5, fontWeight: 600, fontFamily: FONTS.body, cursor: "pointer" }}>{lbl}</button>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: "12px 15px", marginBottom: 16, cursor: "pointer" }}>
              <span style={{ fontSize: 14, color: COLORS.ink }}>Unpaid shifts only</span>
              <input type="checkbox" checked={unpaidOnly} onChange={(e) => setUnpaidOnly(e.target.checked)} style={{ accentColor: COLORS.brand, width: 18, height: 18 }} />
            </label>

            {/* Summary */}
            <div style={{ ...card, display: "flex", justifyContent: "space-around", textAlign: "center", padding: "14px 12px", marginBottom: 18 }}>
              <Summary label={`shift${rows.length === 1 ? "" : "s"}`} value={String(rows.length)} />
              <Summary label="hours" value={totalHours.toFixed(1)} />
              <Summary label="total" value={formatMoney(totalAmount)} accent />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={printPDF} disabled={rows.length === 0} style={{ ...primaryBtn, opacity: rows.length === 0 ? 0.5 : 1 }}>
                <Printer size={17} /> Save as PDF
              </button>
              <button onClick={downloadCSV} disabled={rows.length === 0} style={{ ...secondaryBtn, opacity: rows.length === 0 ? 0.5 : 1 }}>
                <Download size={17} /> CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(11,33,25,0.55)", zIndex: 65, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: "2rem 1rem", fontFamily: FONTS.body };
const card = { background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 16 };
const flabel = { fontFamily: FONTS.body, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: COLORS.label, display: "block", marginBottom: 6 };
const input = { width: "100%", padding: "11px 13px", boxSizing: "border-box", border: `1px solid ${COLORS.border}`, borderRadius: 12, background: "#fff", fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, outline: "none" };
const primaryBtn = { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#0A7B57,#0B3D2E)", color: "#fff", fontFamily: FONTS.body, fontWeight: 600, fontSize: 14, boxShadow: "0 12px 24px -12px rgba(10,123,87,.55)" };
const secondaryBtn = { flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 18px", borderRadius: 14, border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.ink, fontFamily: FONTS.body, fontWeight: 600, fontSize: 14, cursor: "pointer" };

function Summary({ label, value, accent }) {
  return (
    <div>
      <p style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 700, color: accent ? COLORS.brand : COLORS.ink, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: COLORS.label, margin: "3px 0 0", textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>{label}</p>
    </div>
  );
}
