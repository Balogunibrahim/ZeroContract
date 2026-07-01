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

const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer" };

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

export default function AuthScreen({ onShowPrivacy }) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profession, setProfession] = useState("");
  const [taxRegion, setTaxRegion] = useState("rest_of_uk");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (mode === "signup") {
      if (!firstName.trim() || !lastName.trim() || !profession.trim()) {
        setError("First name, last name, and profession are required.");
        return;
      }
      if (!consent) {
        setError("You need to accept the privacy policy to create an account.");
        return;
      }
    }

    setBusy(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      setBusy(false);
      return;
    }

    // Sign up
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }

    // If a session exists immediately (email confirmation disabled), create the profile now.
    // Otherwise the profile gets created on first login via ensureProfile in App.jsx.
    if (data.session && data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        profession: profession.trim(),
        tax_region: taxRegion,
        privacy_consent: true,
        privacy_consent_at: new Date().toISOString(),
      });
      if (profileError) {
        setError("Account created, but saving your profile failed: " + profileError.message);
        setBusy(false);
        return;
      }
    } else {
      // Stash the details locally so App.jsx can finish profile creation after email confirmation + first login.
      sessionStorage.setItem(
        "zc_pending_profile",
        JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          profession: profession.trim(),
          tax_region: taxRegion,
        })
      );
      setInfo("Account created. Check your email to confirm, then log in to finish setup.");
    }

    setBusy(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: FONT_BODY,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>
            SHIFT &amp; EARNINGS LEDGER
          </p>
          <h1 style={{ color: COLORS.offwhite, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, margin: 0, letterSpacing: -0.5 }}>
            Zero Contract
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: COLORS.paper, borderRadius: 6, padding: "1.75rem", boxShadow: "0 12px 32px rgba(0,0,0,0.35)" }}>
          {mode === "signup" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={fieldLabelStyle}>First name</label>
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Last name</label>
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={fieldLabelStyle}>Profession</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bar staff, Delivery driver"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={fieldLabelStyle}>Tax region (for the earnings estimate)</label>
                <select value={taxRegion} onChange={(e) => setTaxRegion(e.target.value)} style={selectStyle}>
                  <option value="rest_of_uk">England, Wales or Northern Ireland</option>
                  <option value="scotland">Scotland</option>
                  <option value="skip">I'll set this later</option>
                </select>
              </div>
            </>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={fieldLabelStyle}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: mode === "signup" ? 14 : 18 }}>
            <label style={fieldLabelStyle}>Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: COLORS.inkSoft, fontFamily: FONT_BODY, lineHeight: 1.4 }}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
                <span>
                  I've read and accept the{" "}
                  <button
                    type="button"
                    onClick={onShowPrivacy}
                    style={{ border: "none", background: "none", color: "#C97F1E", cursor: "pointer", padding: 0, fontSize: 12.5, textDecoration: "underline", fontFamily: FONT_BODY }}
                  >
                    Privacy Policy
                  </button>
                  , and understand how my data is used.
                </span>
              </label>
            </div>
          )}

          {error && <p style={{ color: COLORS.clay, fontSize: 13, marginBottom: 14, fontFamily: FONT_BODY }}>{error}</p>}
          {info && <p style={{ color: COLORS.sage, fontSize: 13, marginBottom: 14, fontFamily: FONT_BODY }}>{info}</p>}

          <button type="submit" disabled={busy} style={primaryButtonStyle}>
            {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p style={{ fontSize: 13, color: COLORS.offwhite, opacity: 0.7, marginTop: 18, textAlign: "center", fontFamily: FONT_BODY }}>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setInfo(""); }}
            style={{ border: "none", background: "none", color: COLORS.amber, cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "underline", fontFamily: FONT_BODY }}
          >
            {mode === "login" ? "Create one" : "Log in"}
          </button>
        </p>

        {mode === "login" && (
          <p style={{ fontSize: 12, color: COLORS.offwhite, opacity: 0.5, marginTop: 10, textAlign: "center", fontFamily: FONT_BODY }}>
            <button
              onClick={onShowPrivacy}
              style={{ border: "none", background: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: 12, textDecoration: "underline", fontFamily: FONT_BODY }}
            >
              Privacy Policy
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
