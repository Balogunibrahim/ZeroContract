import { useState, useEffect, useRef } from "react";
import { X, CalendarPlus } from "lucide-react";
import { getDistance, estimateTravelCost, attachAutocomplete } from "../utils/mapsUtils";
import { downloadShiftICS } from "../utils/calendar";
import { COLORS, FONTS, formatMoney, currencySymbol } from "../theme";

const flabel = {
  fontFamily: FONTS.body,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: COLORS.label,
  display: "block",
  marginBottom: 7,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}
function money(n) {
  return (Number(n) || 0).toFixed(2);
}

const MODES = [
  { id: "driving", label: "Drive" },
  { id: "transit", label: "Bus / train" },
  { id: "walking", label: "Walk" },
];

export default function AddShiftForm({ editingShift, homeAddress, lastWorkAddress, employers = [], onAddEmployer, onSave, onClose, saving, saveError }) {
  const [form, setForm] = useState({
    date: todayISO(),
    start: "09:00",
    end: "17:00",
    rate: "",
    payday: "",
    paid: false,
    notes: "",
    travelCost: "0",
    workAddress: lastWorkAddress || "",
    travelMode: "driving",
    employer: "",
  });
  const [estBusy, setEstBusy] = useState(false);
  const [estError, setEstError] = useState("");
  const [estInfo, setEstInfo] = useState("");
  const [distanceKm, setDistanceKm] = useState(null);
  const [addingEmp, setAddingEmp] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: "", rate: "" });
  const [empErr, setEmpErr] = useState("");
  const [empBusy, setEmpBusy] = useState(false);
  const workAddressRef = useRef(null);

  useEffect(() => {
    attachAutocomplete(workAddressRef.current, (address) =>
      setForm((f) => ({ ...f, workAddress: address }))
    );
  }, []);

  useEffect(() => {
    if (editingShift) {
      setForm({
        date: editingShift.date,
        start: editingShift.start,
        end: editingShift.end,
        rate: String(editingShift.rate),
        payday: editingShift.payday || "",
        paid: editingShift.paid,
        notes: editingShift.notes || "",
        travelCost: String(editingShift.travelCost || 0),
        workAddress: editingShift.workAddress || "",
        travelMode: editingShift.travelMode || "driving",
        employer: editingShift.employer || "",
      });
      setDistanceKm(editingShift.distanceKm || null);
    }
  }, [editingShift]);

  const selectEmployer = (name) => {
    const emp = employers.find((e) => e.name === name);
    setForm((f) => ({ ...f, employer: name, ...(emp ? { rate: String(emp.rate) } : {}) }));
  };

  const saveNewEmployer = async () => {
    setEmpErr("");
    const name = newEmp.name.trim();
    const rate = parseFloat(newEmp.rate);
    if (!name) { setEmpErr("Give the employer a name."); return; }
    if (!(rate > 0)) { setEmpErr("Set an hourly rate."); return; }
    if (employers.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
      setEmpErr("You already have an employer with that name.");
      return;
    }
    setEmpBusy(true);
    const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    try {
      await onAddEmployer({ id, name, rate });
      setForm((f) => ({ ...f, employer: name, rate: String(rate) }));
      setNewEmp({ name: "", rate: "" });
      setAddingEmp(false);
    } catch (err) {
      setEmpErr("Couldn't save that employer. Try again.");
    }
    setEmpBusy(false);
  };

  const handleEstimate = async () => {
    setEstError("");
    setEstInfo("");
    if (!homeAddress) {
      setEstError("Add your home address in Settings first, then come back here.");
      return;
    }
    if (!form.workAddress.trim()) {
      setEstError("Type the workplace address first.");
      return;
    }
    setEstBusy(true);
    try {
      const result = await getDistance(homeAddress, form.workAddress.trim(), form.travelMode);
      setDistanceKm(result.distanceKm);
      const cost = estimateTravelCost(result.distanceKm, form.travelMode, result.fare);
      if (cost != null) {
        setForm((f) => ({ ...f, travelCost: String(cost) }));
        if (form.travelMode === "walking") {
          setEstInfo(result.distanceKm + " km each way, about " + result.durationText + " on foot. No travel cost.");
        } else {
          setEstInfo(result.distanceKm + " km each way, about " + result.durationText + ". Round trip estimate filled in below.");
        }
      } else {
        setEstInfo(result.distanceKm + " km each way, about " + result.durationText + ". Google doesn't know the fare here, so type your usual return fare into Travel cost.");
      }
    } catch (err) {
      setEstError(err.message || "Something went wrong looking that up.");
    }
    setEstBusy(false);
  };

  const hours = calcHours(form.start, form.end);
  const rate = parseFloat(form.rate) || 0;
  const travel = parseFloat(form.travelCost) || 0;
  const gross = hours * rate;
  const takeHome = gross - travel;
  const realRate = hours > 0 ? takeHome / hours : 0;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,33,25,0.55)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        zIndex: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        fontFamily: FONTS.body,
      }}
      onClick={onClose}
    >
      <style>{`
        .asf-inp{width:100%;padding:12px 14px;border:1px solid ${COLORS.border};border-radius:13px;
          background:var(--zc-card);font-family:'Inter',sans-serif;font-size:15px;color:${COLORS.ink};outline:none;
          box-sizing:border-box;transition:border-color .15s,box-shadow .15s}
        .asf-inp:focus{border-color:${COLORS.brand};box-shadow:0 0 0 3px rgba(10,123,87,.12)}
        .asf-body::-webkit-scrollbar{display:none}
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.bg,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -20px 50px rgba(0,0,0,.3)",
          maxWidth: 480,
          width: "100%",
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* grab handle */}
        <div style={{ width: 38, height: 5, borderRadius: 3, background: "#D3DAD6", margin: "10px auto 0" }} />

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 8px" }}>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: COLORS.ink, margin: 0 }}>
            {editingShift ? "Edit shift" : "Add shift"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: 11, border: `1px solid ${COLORS.border}`, background: "#fff", display: "grid", placeItems: "center", color: COLORS.inkSoft, cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* scrollable body */}
        <div className="asf-body" style={{ overflowY: "auto", padding: "6px 20px 22px" }}>
          {/* live preview */}
          <div
            style={{
              background: "linear-gradient(150deg,#0B4835,#0B3D2E 70%,#092b21)",
              borderRadius: 20,
              padding: 18,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div style={{ position: "absolute", right: -30, top: -40, width: 150, height: 150, background: "radial-gradient(circle,rgba(224,160,43,.22),transparent 70%)", borderRadius: "50%" }} />
            <div style={{ fontSize: 11, color: "#9FD0BE", letterSpacing: ".04em", textTransform: "uppercase", fontWeight: 600, position: "relative", zIndex: 2 }}>
              This shift pays
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", margin: "2px 0 0", lineHeight: 1, fontVariantNumeric: "tabular-nums", position: "relative", zIndex: 2 }}>
              <span style={{ color: "#7FC9AC", fontSize: 22 }}>{currencySymbol()}</span>
              {money(gross)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 18px", marginTop: 14, position: "relative", zIndex: 2 }}>
              <div style={{ fontSize: 11, color: "#BFE0D3" }}>
                <b style={{ display: "block", fontFamily: FONTS.display, fontSize: 15, color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{hours.toFixed(1)}h</b>
                worked
              </div>
              <div style={{ fontSize: 11, color: "#BFE0D3" }}>
                <b style={{ display: "block", fontFamily: FONTS.display, fontSize: 15, color: "#fff", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{currencySymbol()}{money(travel)}</b>
                travel
              </div>
              <div style={{ fontSize: 11, color: "#BFE0D3" }}>
                <b style={{ display: "block", fontFamily: FONTS.display, fontSize: 15, color: "#7FC9AC", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{currencySymbol()}{money(takeHome)}</b>
                take home
              </div>
              <div style={{ fontSize: 11, color: "#BFE0D3" }}>
                <b style={{ display: "block", fontFamily: FONTS.display, fontSize: 15, color: "#F0C766", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{currencySymbol()}{realRate.toFixed(2)}/h</b>
                real rate
              </div>
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Date</label>
            <input aria-label="Shift date" className="asf-inp" type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} />
          </div>

          {/* Start / End */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={flabel}>Start</label>
              <input aria-label="Start time" className="asf-inp" type="time" value={form.start} onChange={(e) => set({ start: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={flabel}>End</label>
              <input aria-label="End time" className="asf-inp" type="time" value={form.end} onChange={(e) => set({ end: e.target.value })} />
            </div>
          </div>

          {/* Employer */}
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Employer</label>
            {!addingEmp ? (
              <select
                aria-label="Employer"
                className="asf-inp"
                value={form.employer && !employers.some((e) => e.name === form.employer) ? "__custom" : form.employer}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__new") { setEmpErr(""); setAddingEmp(true); }
                  else if (v === "__custom") { /* keep current custom value */ }
                  else selectEmployer(v);
                }}
                style={{ appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}
              >
                <option value="">No employer / one-off</option>
                {form.employer && !employers.some((e) => e.name === form.employer) && (
                  <option value="__custom">{form.employer}</option>
                )}
                {employers.map((e) => (
                  <option key={e.id || e.name} value={e.name}>
                    {e.name} · £{e.rate}/h
                  </option>
                ))}
                <option value="__new">+ Add new employer…</option>
              </select>
            ) : (
              <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: 12 }}>
                <input
                  aria-label="New employer name"
                  className="asf-inp"
                  type="text"
                  placeholder="Employer name"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp((n) => ({ ...n, name: e.target.value }))}
                  style={{ marginBottom: 8 }}
                  autoFocus
                />
                <input
                  aria-label="New employer hourly rate"
                  className="asf-inp"
                  type="number"
                  step="0.25"
                  inputMode="decimal"
                  placeholder="Hourly rate (£)"
                  value={newEmp.rate}
                  onChange={(e) => setNewEmp((n) => ({ ...n, rate: e.target.value }))}
                />
                {empErr && <p style={{ color: COLORS.danger, fontSize: 12, margin: "8px 0 0" }}>{empErr}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={saveNewEmployer}
                    disabled={empBusy}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "none", background: COLORS.brand, color: "#fff", fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                  >
                    {empBusy ? "Saving…" : "Save employer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAddingEmp(false); setEmpErr(""); setNewEmp({ name: "", rate: "" }); }}
                    style={{ flex: "0 0 auto", padding: "10px 16px", borderRadius: 11, border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.inkSoft, fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rate */}
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Hourly rate (£){form.employer ? " · from employer, editable" : ""}</label>
            <input aria-label="Hourly rate in pounds" className="asf-inp" type="number" step="0.25" inputMode="decimal" placeholder="12.50" value={form.rate} onChange={(e) => set({ rate: e.target.value })} />
          </div>

          {/* Workplace address + estimate */}
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Workplace address</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={workAddressRef}
                aria-label="Workplace address"
                className="asf-inp"
                type="text"
                placeholder="Where is the shift?"
                value={form.workAddress}
                onChange={(e) => set({ workAddress: e.target.value })}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleEstimate}
                disabled={estBusy}
                style={{
                  flex: "0 0 auto",
                  padding: "0 15px",
                  borderRadius: 13,
                  border: `1px solid ${COLORS.brand}`,
                  background: COLORS.tint,
                  color: COLORS.brand,
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {estBusy ? "…" : "Estimate travel"}
              </button>
            </div>
            {estInfo && (
              <div style={{ fontSize: 11.5, color: COLORS.brand, marginTop: 7, background: COLORS.tint, borderRadius: 10, padding: "8px 11px", lineHeight: 1.4 }}>
                {estInfo}
              </div>
            )}
            {estError && (
              <div style={{ fontSize: 11.5, color: COLORS.danger, marginTop: 7, lineHeight: 1.4 }}>
                {estError}
              </div>
            )}
          </div>

          {/* Getting there */}
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Getting there</label>
            <div style={{ display: "flex", gap: 8 }}>
              {MODES.map((m) => {
                const on = form.travelMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => set({ travelMode: m.id })}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      border: on ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                      background: on ? COLORS.deep : COLORS.card,
                      color: on ? "#fff" : COLORS.inkSoft,
                      fontSize: 12.5,
                      fontWeight: 600,
                      fontFamily: FONTS.body,
                      cursor: "pointer",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel cost */}
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Travel cost, round trip (£)</label>
            <input aria-label="Travel cost, round trip, in pounds" className="asf-inp" type="number" step="0.50" inputMode="decimal" placeholder="0.00" value={form.travelCost} onChange={(e) => set({ travelCost: e.target.value })} />
          </div>

          {/* Payday */}
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Payday</label>
            <input aria-label="Payday date" className="asf-inp" type="date" value={form.payday} onChange={(e) => set({ payday: e.target.value })} />
          </div>

          {/* Already paid toggle */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: "13px 15px" }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.ink }}>
                Already paid?
                <small style={{ display: "block", fontSize: 11.5, color: COLORS.inkSoft, fontWeight: 400, marginTop: 2 }}>Mark this shift as settled</small>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.paid}
                aria-label="Already paid"
                onClick={() => set({ paid: !form.paid })}
                style={{
                  width: 46,
                  height: 27,
                  borderRadius: 20,
                  background: form.paid ? COLORS.brand : "#D3DAD6",
                  position: "relative",
                  cursor: "pointer",
                  flex: "0 0 46px",
                  border: "none",
                  padding: 0,
                  transition: "background .18s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: form.paid ? 22 : 3,
                    width: 21,
                    height: 21,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                    transition: "left .18s",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Notes</label>
            <textarea
              aria-label="Notes"
              className="asf-inp"
              placeholder="Anything to remember about this shift"
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
              style={{ resize: "none", minHeight: 64 }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!form.date || !form.start) return;
              downloadShiftICS(
                { id: editingShift?.id, date: form.date, start: form.start, end: form.end, hours, rate: parseFloat(form.rate) || 0, notes: form.notes, workAddress: form.workAddress, employer: form.employer },
                form.employer || "Shift"
              );
            }}
            style={{
              width: "100%",
              padding: 13,
              borderRadius: 14,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.tint,
              color: COLORS.brand,
              cursor: "pointer",
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <CalendarPlus size={17} /> Add 1-hour reminder to calendar
          </button>

          {saveError && <p style={{ fontFamily: FONTS.body, color: COLORS.danger, fontSize: 13, margin: "0 0 12px" }}>{saveError}</p>}

          <button
            onClick={() => onSave({ ...form, distanceKm })}
            disabled={saving}
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 15,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg,#0A7B57,#0B3D2E)",
              color: "#fff",
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: "0 12px 24px -10px rgba(10,123,87,.6)",
              marginTop: 6,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : editingShift ? "Save changes" : "Save shift"}
          </button>
        </div>
      </div>
    </div>
  );
}
