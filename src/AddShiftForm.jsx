import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { getDistance, estimateTravelCost, attachAutocomplete } from "./mapsUtils";

const COLORS = {
  paper: "#F7F3EC",
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  clay: "#C2543F",
  offwhite: "#EDEAE2",
};
const FONT_BODY = "'Inter', -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

const fieldLabelStyle = {
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: COLORS.inkSoft,
  fontFamily: FONT_MONO,
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  boxSizing: "border-box",
  border: `1px solid ${COLORS.paperDim}`,
  borderBottom: `2px solid ${COLORS.ink}`,
  borderRadius: 3,
  background: "white",
  fontFamily: FONT_BODY,
  fontSize: 15,
  color: COLORS.ink,
  outline: "none",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 4,
  border: "none",
  background: COLORS.ink,
  color: COLORS.offwhite,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 0.5,
  fontFamily: FONT_BODY,
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

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "GBP" });
}

export default function AddShiftForm({ editingShift, homeAddress, lastWorkAddress, onSave, onClose, saving, saveError }) {
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
  });
  const [estBusy, setEstBusy] = useState(false);
  const [estError, setEstError] = useState("");
  const [estInfo, setEstInfo] = useState("");
  const [distanceKm, setDistanceKm] = useState(null);
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
      });
      setDistanceKm(editingShift.distanceKm || null);
    }
  }, [editingShift]);

  const handleEstimate = async () => {
    setEstError("");
    setEstInfo("");
    if (!homeAddress) {
      setEstError("Add your home address in the Profile tab first, then come back here.");
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
        setEstInfo(result.distanceKm + " km each way, about " + result.durationText + ". Round trip estimate filled in below.");
      } else {
        setEstInfo(result.distanceKm + " km each way, about " + result.durationText + ". Google doesn't know the fare here, so type your usual return fare into Travel cost.");
      }
    } catch (err) {
      setEstError(err.message || "Something went wrong looking that up.");
    }
    setEstBusy(false);
  };

  const hours = calcHours(form.start, form.end);
  const est = hours * (parseFloat(form.rate) || 0);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(21,32,59,0.85)",
        zIndex: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflowY: "auto",
        padding: "2rem 1rem",
        fontFamily: FONT_BODY,
      }}
    >
      <div style={{ background: COLORS.paper, borderRadius: 8, maxWidth: 420, width: "100%", padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, color: COLORS.inkSoft, margin: 0 }}>
            {editingShift ? "EDIT SHIFT" : "NEW SHIFT"}
          </p>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <X size={16} color={COLORS.inkSoft} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={fieldLabelStyle}>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={fieldLabelStyle}>Start</label>
            <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={fieldLabelStyle}>End</label>
            <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={fieldLabelStyle}>Rate / hr</label>
            <input type="number" step="0.01" placeholder="12.50" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={fieldLabelStyle}>Payday</label>
            <input type="date" value={form.payday} onChange={(e) => setForm({ ...form, payday: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={fieldLabelStyle}>Travel cost</label>
            <input type="number" step="0.01" placeholder="0" value={form.travelCost} onChange={(e) => setForm({ ...form, travelCost: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={fieldLabelStyle}>Workplace address (optional)</label>
          <input
            ref={workAddressRef}
            type="text"
            placeholder="Start typing the workplace address..."
            value={form.workAddress}
            onChange={(e) => setForm({ ...form, workAddress: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end", marginBottom: 8 }}>
          <div>
            <label style={fieldLabelStyle}>How you'll travel</label>
            <select
              value={form.travelMode}
              onChange={(e) => setForm({ ...form, travelMode: e.target.value })}
              style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
            >
              <option value="driving">Driving</option>
              <option value="transit">Public transport</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleEstimate}
            disabled={estBusy}
            style={{
              padding: "10px 14px",
              borderRadius: 4,
              border: "1px solid " + COLORS.ink,
              background: "white",
              color: COLORS.ink,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT_MONO,
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            {estBusy ? "..." : "ESTIMATE TRAVEL"}
          </button>
        </div>

        {estError && <p style={{ color: COLORS.clay, fontSize: 12.5, margin: "0 0 10px", lineHeight: 1.4 }}>{estError}</p>}
        {estInfo && <p style={{ color: COLORS.inkSoft, fontSize: 12.5, margin: "0 0 10px", lineHeight: 1.4 }}>{estInfo}</p>}

        <div style={{ marginBottom: 14 }}>
          <label style={fieldLabelStyle}>Notes</label>
          <input type="text" placeholder="e.g. Covering for Sam" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: COLORS.inkSoft }}>
            <input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} /> Already paid
          </label>
          <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.inkSoft }}>
            {hours}h &middot; est. {formatMoney(est)}
          </span>
        </div>

        {saveError && <p style={{ color: COLORS.clay, fontSize: 13, marginBottom: 12 }}>{saveError}</p>}

        <button onClick={() => onSave({ ...form, distanceKm })} disabled={saving} style={primaryButtonStyle}>
          {saving ? "Saving..." : editingShift ? "Save changes" : "Add to ledger"}
        </button>
      </div>
    </div>
  );
}
