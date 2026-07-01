import { useState } from "react";
import { supabase } from "./supabaseClient";

const COLORS = {
  navy: "#15203B",
  paper: "#F7F3EC",
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  clay: "#C2543F",
  sage: "#7C9070",
  offwhite: "#EDEAE2",
};

const FONT_DISPLAY = "'Roboto Slab', 'Georgia', serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

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
      setInfo("Password updated successfully. Taking you to your ledger...");
      setTimeout(() => onDone(), 2000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: FONT_BODY }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>
            SHIFT &amp; EARNINGS LEDGER
          </p>
          <h1 style={{ color: COLORS.offwhite, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, margin: 0, letterSpacing: -0.5 }}>
            Zero Contract
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ background: COLORS.paper, borderRadius: 6, padding: "1.75rem", boxShadow: "0 12px 32px rgba(0,0,0,0.35)" }}
        >
          <p style={{ fontSize: 14, color: COLORS.inkSoft, marginBottom: 20, lineHeight: 1.5 }}>
            Choose a new password for your account.
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: FONT_MONO, display: "block", marginBottom: 6 }}>
              New password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", border: `1px solid ${COLORS.paperDim}`, borderBottom: `2px solid ${COLORS.ink}`, borderRadius: 3, background: "white", fontFamily: FONT_BODY, fontSize: 15, color: COLORS.ink, outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: FONT_MONO, display: "block", marginBottom: 6 }}>
              Confirm new password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", border: `1px solid ${COLORS.paperDim}`, borderBottom: `2px solid ${COLORS.ink}`, borderRadius: 3, background: "white", fontFamily: FONT_BODY, fontSize: 15, color: COLORS.ink, outline: "none" }}
            />
          </div>

          {error && <p style={{ color: COLORS.clay, fontSize: 13, marginBottom: 14 }}>{error}</p>}
          {info && <p style={{ color: COLORS.sage, fontSize: 13, marginBottom: 14 }}>{info}</p>}

          <button
            type="submit"
            disabled={busy}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 4, border: "none", background: COLORS.ink, color: COLORS.offwhite, cursor: "pointer", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, fontFamily: FONT_BODY }}
          >
            {busy ? "Updating..." : "Set new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
