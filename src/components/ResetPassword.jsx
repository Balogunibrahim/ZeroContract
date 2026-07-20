import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { COLORS, FONTS, LogoLockup } from "../theme";

const SHELL_BG = "radial-gradient(120% 70% at 50% 0%,#123f30,#0d2c22 60%,#0a211a)";

const flabel = {
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
  padding: "11px 13px",
  boxSizing: "border-box",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  background: "#fff",
  fontFamily: FONTS.body,
  fontSize: 14,
  color: COLORS.ink,
  outline: "none",
};

const primaryBtn = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(135deg,#0A7B57,#0B3D2E)",
  color: "#fff",
  fontFamily: FONTS.body,
  fontWeight: 600,
  fontSize: 15,
  boxShadow: "0 12px 24px -10px rgba(10,123,87,.55)",
  marginTop: 8,
};

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
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setBusy(false);
    } else {
      setInfo("Password updated — taking you to your ledger…");
      setTimeout(() => onDone(), 1800);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: SHELL_BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: FONTS.body, textAlign: "left" }}>
      <div style={{ width: "100%", maxWidth: 420, background: COLORS.bg, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 60px -22px rgba(0,0,0,.6)" }}>
        <div style={{ background: "linear-gradient(150deg,#0B4835,#0B3D2E 75%,#092b21)", padding: "30px 24px 26px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -40, width: 150, height: 150, background: "radial-gradient(circle,rgba(224,160,43,.22),transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "relative" }}>
            <LogoLockup size={28} dark />
          </div>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 23, fontWeight: 700, letterSpacing: "-0.02em", margin: "18px 0 4px", position: "relative" }}>Set a new password</h2>
          <p style={{ fontSize: 12.5, color: "#BFE0D3", position: "relative", margin: 0 }}>Almost done — choose a new password</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 22px 24px" }}>
          <div style={{ marginBottom: 13 }}>
            <label style={flabel}>New password</label>
            <input aria-label="New password" className="zc-inp" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={inp} placeholder="At least 8 characters" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={flabel}>Confirm new password</label>
            <input aria-label="Confirm new password" className="zc-inp" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inp} />
          </div>
          {error && <p style={{ fontFamily: FONTS.body, color: COLORS.danger, fontSize: 12.5, margin: "0 0 12px", lineHeight: 1.45 }}>{error}</p>}
          {info && <p style={{ fontFamily: FONTS.body, color: COLORS.brand, fontSize: 12.5, margin: "0 0 12px", lineHeight: 1.45, background: COLORS.tint, borderRadius: 10, padding: "9px 12px" }}>{info}</p>}
          <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>{busy ? "Updating…" : "Set new password"}</button>
        </form>
      </div>
    </div>
  );
}
