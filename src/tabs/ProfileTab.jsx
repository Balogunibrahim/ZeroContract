import { useState } from "react";
import { LogOut } from "lucide-react";
import NotificationToggle from "../NotificationToggle";

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

export default function ProfileTab({ profile, session, onSave, onShowPrivacy, onLogout }) {
  const [taxRegion, setTaxRegion] = useState(profile?.tax_region || "rest_of_uk");
  const [otherIncome, setOtherIncome] = useState(String(profile?.other_income || "0"));
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [profession, setProfession] = useState(profile?.profession || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      profession: profession.trim(),
      tax_region: taxRegion,
      other_income: parseFloat(otherIncome) || 0,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "1.5rem 1.25rem 5rem" }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, color: COLORS.inkSoft, margin: "0 0 20px" }}>
        PROFILE
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={fieldLabelStyle}>First name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabelStyle}>Last name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>Profession</label>
        <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>Tax region</label>
        <select value={taxRegion} onChange={(e) => setTaxRegion(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
          <option value="rest_of_uk">England, Wales or Northern Ireland</option>
          <option value="scotland">Scotland</option>
          <option value="skip">Prefer not to say</option>
        </select>
      </div>
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabelStyle}>Other annual income (GBP)</label>
        <input type="number" step="100" placeholder="0" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} style={inputStyle} />
        <p style={{ fontSize: 12, color: COLORS.inkSoft, margin: "6px 0 0", lineHeight: 1.4 }}>
          Add other income so the tax estimate reflects your full picture. Optional.
        </p>
      </div>
      <button onClick={handleSave} disabled={saving} style={primaryButtonStyle}>
        {saved ? "Saved" : saving ? "Saving..." : "Save changes"}
      </button>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.paperDim}` }}>
        <NotificationToggle userId={session?.user?.id} />
      </div>

      <div style={{ marginTop: 8, paddingTop: 16, borderTop: `1px solid ${COLORS.paperDim}`, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onShowPrivacy} style={{ border: "none", background: "none", color: COLORS.inkSoft, cursor: "pointer", fontSize: 13, padding: 0, textDecoration: "underline", fontFamily: FONT_BODY }}>
          Privacy Policy
        </button>
        <button onClick={onLogout} style={{ border: "none", background: "none", color: COLORS.clay, cursor: "pointer", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT_BODY }}>
          <LogOut size={13} /> Log out
        </button>
      </div>
    </div>
  );
}
