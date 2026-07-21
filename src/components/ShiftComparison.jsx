import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, Check } from "lucide-react";
import { estimateTax } from "../utils/taxUtils";
import { getDistance, estimateTravelCost, attachAutocomplete } from "../utils/mapsUtils";
import { COLORS, FONTS, formatMoney } from "../theme";

const fieldLabelStyle = {
  fontFamily: FONTS.body,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: COLORS.label,
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  boxSizing: "border-box",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  background: COLORS.card,
  fontFamily: FONTS.body,
  fontSize: 15,
  fontWeight: 600,
  color: COLORS.ink,
  outline: "none",
};

const MODES = [
  { id: "driving", label: "Drive" },
  { id: "transit", label: "Bus / train" },
  { id: "walking", label: "Walk" },
];

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function newCandidate() {
  return { id: uid(), name: "", start: "09:00", end: "17:00", rate: "", travelCost: "0", workAddress: "", travelMode: "driving", distanceKm: null, estBusy: false, estMsg: "", estErr: "" };
}

// Address field that wires up Google autocomplete on mount.
function AddressInput({ value, onChange, onSelect, ariaLabel }) {
  const ref = useRef(null);
  useEffect(() => {
    attachAutocomplete(ref.current, onSelect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <input
      ref={ref}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Where is the shift?"
      style={{ ...inputStyle, fontWeight: 500 }}
    />
  );
}

export default function ShiftComparison({ profile, baselineEarnings, onClose }) {
  const [candidates, setCandidates] = useState([newCandidate(), newCandidate()]);
  const homeAddress = profile?.home_address || "";

  const region = profile?.tax_region && profile.tax_region !== "skip" ? profile.tax_region : "rest_of_uk";
  const baseIncome = (baselineEarnings || 0) + (profile?.other_income || 0);

  const update = (id, patch) =>
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const addCandidate = () => setCandidates((prev) => [...prev, newCandidate()]);
  const removeCandidate = (id) => setCandidates((prev) => prev.filter((c) => c.id !== id));

  const estimate = async (c) => {
    if (!homeAddress) {
      update(c.id, { estErr: "Add your home address in Settings first.", estMsg: "" });
      return;
    }
    if (!c.workAddress.trim()) {
      update(c.id, { estErr: "Type the workplace address first.", estMsg: "" });
      return;
    }
    update(c.id, { estBusy: true, estErr: "", estMsg: "" });
    try {
      const res = await getDistance(homeAddress, c.workAddress.trim(), c.travelMode);
      const cost = estimateTravelCost(res.distanceKm, c.travelMode, res.fare);
      update(c.id, {
        estBusy: false,
        distanceKm: res.distanceKm,
        travelCost: cost != null ? String(cost) : c.travelCost,
        estMsg: cost != null
          ? `${res.distanceKm} km each way, about ${res.durationText}.`
          : `${res.distanceKm} km each way. Type your usual return fare in Travel £.`,
      });
    } catch (err) {
      update(c.id, { estBusy: false, estErr: err.message || "Couldn't look that up." });
    }
  };

  const results = candidates.map((c, i) => {
    const hours = calcHours(c.start, c.end);
    const rate = parseFloat(c.rate) || 0;
    const travelCost = parseFloat(c.travelCost) || 0;
    const gross = Math.round(hours * rate * 100) / 100;
    const withShift = estimateTax(baseIncome + gross, 0, region);
    const withoutShift = estimateTax(baseIncome, 0, region);
    const deduction = Math.max(0, withShift.totalDeductions - withoutShift.totalDeductions);
    const net = gross - deduction - travelCost;
    const netPerHour = hours > 0 ? net / hours : 0;
    return { ...c, index: i, hours, rate, travelCost, gross, deduction, net, netPerHour };
  });

  const valid = results.filter((r) => r.hours > 0 && r.rate > 0);
  const sorted = [...valid].sort((a, b) => b.netPerHour - a.netPerHour);
  const best = sorted[0];
  const second = sorted[1];
  const label = (c, i) => (c.name && c.name.trim() ? c.name.trim() : `Offer ${i + 1}`);

  return (
    <div style={overlayStyle}>
      <div style={{ background: COLORS.bg, borderRadius: 24, maxWidth: 560, width: "100%", padding: "1.75rem", boxShadow: "0 30px 60px -22px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.ink, margin: 0 }}>Compare shifts</p>
          <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 11, border: `1px solid ${COLORS.border}`, background: COLORS.card, display: "grid", placeItems: "center", color: COLORS.inkSoft, cursor: "pointer" }}><X size={16} /></button>
        </div>
        <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, margin: "0 0 20px", lineHeight: 1.55 }}>
          Enter two offers with their addresses. We work out the distance from home and show which one actually pays more per hour once tax and travel are taken off.
        </p>

        {candidates.map((c, i) => {
          const r = results.find((res) => res.id === c.id);
          const isBest = best && c.id === best.id && sorted.length > 1;
          const showResults = r && r.hours > 0 && r.rate > 0;
          return (
            <div
              key={c.id}
              style={{
                position: "relative",
                background: COLORS.card,
                border: `1.5px solid ${isBest ? COLORS.brand : COLORS.border}`,
                borderRadius: 20,
                padding: "16px 17px",
                marginBottom: 14,
                boxShadow: isBest ? "0 12px 26px -14px rgba(10,123,87,.4)" : "0 1px 2px rgba(11,61,46,.04)",
              }}
            >
              {isBest && (
                <span style={{ position: "absolute", top: -10, left: 16, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", padding: "4px 10px", borderRadius: 8, background: COLORS.brand, color: "#fff" }}>Better deal</span>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <input
                  aria-label={`Offer ${i + 1} name`}
                  value={c.name}
                  onChange={(e) => update(c.id, { name: e.target.value })}
                  placeholder={`Offer ${i + 1}`}
                  style={{ ...inputStyle, border: "none", padding: "2px 0", fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, borderRadius: 0 }}
                />
                {candidates.length > 1 && (
                  <button onClick={() => removeCandidate(c.id)} aria-label="Remove offer" style={{ border: "none", background: "none", padding: 8, margin: -8, color: COLORS.label, cursor: "pointer", display: "flex", flexShrink: 0 }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Start"><input aria-label={`Offer ${i + 1} start`} type="time" value={c.start} onChange={(e) => update(c.id, { start: e.target.value })} style={inputStyle} /></Field>
                <Field label="End"><input aria-label={`Offer ${i + 1} end`} type="time" value={c.end} onChange={(e) => update(c.id, { end: e.target.value })} style={inputStyle} /></Field>
                <Field label="Rate £/hr"><input aria-label={`Offer ${i + 1} rate`} type="number" step="0.01" placeholder="12.50" value={c.rate} onChange={(e) => update(c.id, { rate: e.target.value })} style={inputStyle} /></Field>
                <Field label="Travel £"><input aria-label={`Offer ${i + 1} travel cost`} type="number" step="0.01" placeholder="0" value={c.travelCost} onChange={(e) => update(c.id, { travelCost: e.target.value })} style={inputStyle} /></Field>
              </div>

              {/* Address + estimate */}
              <div style={{ marginTop: 12 }}>
                <label style={fieldLabelStyle}>Workplace address</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <AddressInput
                      ariaLabel={`Offer ${i + 1} workplace address`}
                      value={c.workAddress}
                      onChange={(v) => update(c.id, { workAddress: v })}
                      onSelect={(addr) => update(c.id, { workAddress: addr })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => estimate(c)}
                    disabled={c.estBusy}
                    style={{ flex: "0 0 auto", padding: "0 14px", borderRadius: 12, border: `1px solid ${COLORS.brand}`, background: COLORS.tint, color: COLORS.brand, fontFamily: FONTS.body, fontWeight: 600, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {c.estBusy ? "…" : "Estimate"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {MODES.map((m) => {
                    const on = c.travelMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => update(c.id, { travelMode: m.id })}
                        style={{ flex: 1, padding: "7px 0", borderRadius: 10, border: on ? "1px solid transparent" : `1px solid ${COLORS.border}`, background: on ? COLORS.deep : COLORS.card, color: on ? "#fff" : COLORS.inkSoft, fontSize: 11.5, fontWeight: 600, fontFamily: FONTS.body, cursor: "pointer" }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
                {c.estMsg && <p style={{ fontSize: 11.5, color: COLORS.brand, margin: "8px 0 0", background: COLORS.tint, borderRadius: 10, padding: "8px 11px", lineHeight: 1.4 }}>{c.estMsg}</p>}
                {c.estErr && <p style={{ fontSize: 11.5, color: COLORS.danger, margin: "8px 0 0", lineHeight: 1.4 }}>{c.estErr}</p>}
              </div>

              {showResults && (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${COLORS.line}` }}>
                    <span style={{ fontSize: 12, color: COLORS.inkSoft }}>
                      {r.hours.toFixed(1)}h{c.distanceKm ? ` · ${c.distanceKm} km each way` : ""}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: FONTS.display, fontSize: 12, color: COLORS.label, textDecoration: "line-through" }}>{formatMoney(r.rate)}/h</div>
                      <div style={{ fontFamily: FONTS.display, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: COLORS.ink }}>{formatMoney(r.netPerHour)}</div>
                      <div style={{ fontSize: 10, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>real / hr</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 14 }}>
                    <MiniStat label="Gross" value={formatMoney(r.gross)} />
                    <MiniStat label="Tax+NI" value={`−${formatMoney(r.deduction)}`} red />
                    <MiniStat label="Travel" value={`−${formatMoney(r.travelCost)}`} red />
                    <MiniStat label="Net" value={formatMoney(r.net)} green />
                  </div>
                </>
              )}
            </div>
          );
        })}

        {best && second && (
          <div style={{ background: "linear-gradient(135deg,#0A7B57,#0B3D2E)", borderRadius: 20, padding: "18px 20px", color: "#fff", display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
            <span style={{ width: 42, height: 42, flex: "0 0 42px", borderRadius: "50%", background: "rgba(255,255,255,.16)", display: "grid", placeItems: "center" }}>
              <Check size={22} strokeWidth={2.5} />
            </span>
            <div>
              <b style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, display: "block" }}>
                {label(best, best.index)} wins by {formatMoney(Math.max(0, best.netPerHour - second.netPerHour))}/hr
              </b>
              <span style={{ fontSize: 12, color: "#BFE0D3", display: "block", marginTop: 2, lineHeight: 1.4 }}>
                After tax and the travel to get there, it leaves more in your pocket every hour.
              </span>
            </div>
          </div>
        )}

        <button onClick={addCandidate} style={addBtn}>
          <Plus size={15} /> Add another offer
        </button>

        <p style={{ fontFamily: FONTS.body, fontSize: 11.5, color: COLORS.label, marginTop: 14, lineHeight: 1.5 }}>
          Distance and tax are estimates. Real figures depend on the route and your total year's income.
        </p>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(11,33,25,0.55)",
  zIndex: 50,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflowY: "auto",
  padding: "2rem 1rem",
  fontFamily: FONTS.body,
};

const addBtn = {
  width: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "14px",
  background: "none",
  border: `1.5px dashed ${COLORS.border}`,
  borderRadius: 16,
  color: COLORS.brand,
  fontFamily: FONTS.body,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 14,
};

function Field({ label, children }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  );
}

function MiniStat({ label, value, red, green }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: FONTS.body, fontSize: 9, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: COLORS.label, margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontFamily: FONTS.display, fontSize: 13, fontWeight: 600, color: red ? COLORS.danger : green ? COLORS.brand : COLORS.ink, margin: 0, whiteSpace: "nowrap" }}>{value}</p>
    </div>
  );
}
