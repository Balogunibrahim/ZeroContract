import { useState, useRef, useEffect } from "react";
import { LogOut, Pencil } from "lucide-react";
import NotificationToggle from "../components/NotificationToggle";
import { attachAutocomplete } from "../utils/mapsUtils";
import { COLORS, FONTS, ScreenLabel, DisplayHeader } from "../theme";

const REGION_LABELS = {
  rest_of_uk: "England / Wales / NI",
  scotland: "Scotland",
  skip: "Prefer not to say",
};

export default function ProfileTab({ profile, session, onSave, onShowPrivacy, onLogout }) {
  const [editing, setEditing] = useState(false);

  const [taxRegion, setTaxRegion] = useState(profile?.tax_region || "rest_of_uk");
  const [otherIncome, setOtherIncome] = useState(String(profile?.other_income || "0"));
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [profession, setProfession] = useState(profile?.profession || "");
  const [homeAddress, setHomeAddress] = useState(profile?.home_address || "");
  const homeAddressRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    if (editing && homeAddressRef.current) {
      attachAutocomplete(homeAddressRef.current, (address) => setHomeAddress(address));
    }
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    setSaveErr("");
    const errMsg = await onSave({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      profession: profession.trim(),
      home_address: homeAddress.trim(),
      tax_region: taxRegion,
      other_income: parseFloat(otherIncome) || 0,
    });
    setSaving(false);
    if (errMsg) setSaveErr("Couldn't save: " + errMsg);
    else setEditing(false);
  };

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.75rem 1.25rem 6rem" }}>
      <ScreenLabel>You</ScreenLabel>
      <DisplayHeader>Profile</DisplayHeader>

      {/* Name + edit */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
        <div>
          <p style={labelSmall}>Name</p>
          <p style={{ fontFamily: FONTS.body, fontSize: 24, fontWeight: 700, color: COLORS.ink, margin: "6px 0 0" }}>
            {fullName || "—"}
          </p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={editBtn}>
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Field label="First name"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} /></Field>
            <Field label="Last name"><input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} /></Field>
          </div>
          <Field label="Profession" mb><input value={profession} onChange={(e) => setProfession(e.target.value)} style={inputStyle} /></Field>
          <Field label="Home address" mb>
            <input ref={homeAddressRef} placeholder="Start typing your address..." value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Tax region" mb>
            <select value={taxRegion} onChange={(e) => setTaxRegion(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
              <option value="rest_of_uk">England, Wales or Northern Ireland</option>
              <option value="scotland">Scotland</option>
              <option value="skip">Prefer not to say</option>
            </select>
          </Field>
          <Field label="Other annual income (£)" mb>
            <input type="number" step="100" placeholder="0" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} style={inputStyle} />
          </Field>

          {saveErr && <p style={{ fontFamily: FONTS.body, color: COLORS.danger, fontSize: 13, margin: "0 0 12px" }}>{saveErr}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={primaryBtn}>{saving ? "Saving..." : "Save changes"}</button>
            <button onClick={() => setEditing(false)} style={secondaryBtn}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <InfoCard label="Profession" value={profession || "—"} />
          <InfoCard label="Home address" value={homeAddress || "—"} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 30 }}>
            <InfoCard label="Tax region" value={REGION_LABELS[taxRegion] || "—"} flush />
            <InfoCard label="Other income" value={`£${parseFloat(otherIncome) || 0}`} flush />
          </div>

          <p style={{ ...labelSmall, marginBottom: 12 }}>Reminders</p>
          <NotificationToggle userId={session?.user?.id} />
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: 28, paddingTop: 18, borderTop: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onShowPrivacy} style={{ ...linkBtn, textDecoration: "underline" }}>Privacy Policy</button>
        <button onClick={onLogout} style={{ ...linkBtn, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <LogOut size={14} /> Log out
        </button>
      </div>
    </div>
  );
}

const labelSmall = {
  fontFamily: FONTS.body,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: COLORS.label,
  margin: 0,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  boxSizing: "border-box",
  border: `1px solid ${COLORS.border}`,
  borderBottom: `2px solid ${COLORS.ink}`,
  borderRadius: 2,
  background: COLORS.card,
  fontFamily: FONTS.body,
  fontSize: 15,
  color: COLORS.ink,
  outline: "none",
};

const editBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  borderRadius: 20,
  border: `1px solid ${COLORS.ink}`,
  background: "transparent",
  color: COLORS.ink,
  fontFamily: FONTS.body,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
  cursor: "pointer",
  flexShrink: 0,
};

const primaryBtn = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 2,
  border: "none",
  background: COLORS.black,
  color: "#fff",
  cursor: "pointer",
  fontFamily: FONTS.body,
  fontSize: 14,
  fontWeight: 600,
};

const secondaryBtn = {
  padding: "12px 20px",
  borderRadius: 2,
  border: `1px solid ${COLORS.ink}`,
  background: "transparent",
  color: COLORS.ink,
  cursor: "pointer",
  fontFamily: FONTS.body,
  fontSize: 14,
  fontWeight: 600,
};

const linkBtn = {
  border: "none",
  background: "none",
  padding: 0,
  color: COLORS.inkSoft,
  cursor: "pointer",
  fontFamily: FONTS.body,
  fontSize: 13,
};

function Field({ label, children, mb }) {
  return (
    <div style={{ marginBottom: mb ? 14 : 0 }}>
      <label style={{ ...labelSmall, fontSize: 10, letterSpacing: 1, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function InfoCard({ label, value, flush }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 2, padding: "16px 18px", marginBottom: flush ? 0 : 12 }}>
      <p style={{ ...labelSmall, fontSize: 10, letterSpacing: 1 }}>{label}</p>
      <p style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: COLORS.ink, margin: "7px 0 0", wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}
