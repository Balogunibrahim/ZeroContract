import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { COLORS, FONTS } from "../theme";

const fieldLabel = {
  fontFamily: FONTS.body,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: COLORS.label,
  display: "block",
  marginBottom: 6,
};

const inp = {
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

function extrude(steps) {
  const l = [];
  for (let i = 1; i <= steps; i++) {
    const v = Math.round(205 + (i / steps) * 33);
    l.push(`-${i}px -${i}px 0 rgb(${v},${v},${v})`);
  }
  return l.join(", ");
}

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setBusy(false);
    } else {
      setInfo("Password updated. Taking you to your ledger...");
      setTimeout(() => onDone(), 2000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: FONTS.body, textAlign: "left" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label, margin: "0 0 6px" }}>
            Shift &amp; earnings ledger
          </p>
          <h1 style={{ fontFamily: FONTS.display, fontWeight: 400, fontSize: "clamp(30px, 9vw, 38px)", lineHeight: 1, letterSpacing: "-0.01em", textTransform: "uppercase", color: COLORS.ink, margin: 0, textShadow: extrude(9) }}>
            Zero Contract
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 2, padding: "1.75rem" }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginBottom: 20, lineHeight: 1.5 }}>
            Choose a new password for your account.
          </p>
          <div style={{ marginBottom: 14 }}>
            <label style={fieldLabel}>New password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={inp} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={fieldLabel}>Confirm new password</label>
            <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inp} />
          </div>
          {error && <p style={{ fontFamily: FONTS.body, color: COLORS.danger, fontSize: 13, marginBottom: 14 }}>{error}</p>}
          {info && <p style={{ fontFamily: FONTS.body, color: COLORS.ink, fontSize: 13, marginBottom: 14 }}>{info}</p>}
          <button type="submit" disabled={busy} style={{ width: "100%", padding: "13px 16px", borderRadius: 2, border: "none", background: COLORS.black, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: FONTS.body }}>
            {busy ? "Updating..." : "Set new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
