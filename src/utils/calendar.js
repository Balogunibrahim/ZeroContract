// Build a calendar event (.ics) for a shift with a 1-hour-before alarm, so the
// user's phone rings even when the app is closed.

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Floating local datetime "YYYYMMDDTHHMMSS" (no timezone -> device local time,
// which matches how shift times are stored).
function floatLocal(dateISO, hhmm, addDay) {
  const [Y, M, D] = dateISO.split("-").map(Number);
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  const dt = new Date(Y, M - 1, D + (addDay ? 1 : 0), h, m, 0);
  return `${dt.getFullYear()}${pad2(dt.getMonth() + 1)}${pad2(dt.getDate())}T${pad2(dt.getHours())}${pad2(dt.getMinutes())}00`;
}

function toMinutes(hhmm) {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
}

function esc(s) {
  return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildShiftICS(s, title) {
  const overnight = toMinutes(s.end) <= toMinutes(s.start);
  const dtStart = floatLocal(s.date, s.start, false);
  const dtEnd = floatLocal(s.date, s.end, overnight);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `${s.id || Math.random().toString(36).slice(2)}@zerocontract`;

  const descParts = [];
  if (s.hours) descParts.push(`${Number(s.hours).toFixed(1)}h`);
  if (s.rate) descParts.push(`£${Number(s.rate)}/h`);
  if (s.notes) descParts.push(s.notes);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ZeroContract//Shift//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${esc(title || "Shift")}`,
    descParts.length ? `DESCRIPTION:${esc(descParts.join(" · "))}` : null,
    s.workAddress ? `LOCATION:${esc(s.workAddress)}` : null,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Shift starts in 1 hour",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

export function downloadShiftICS(s, title) {
  const ics = buildShiftICS(s, title);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(title || "shift").replace(/\s+/g, "-").toLowerCase()}-reminder.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
