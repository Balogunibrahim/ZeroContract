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

const primaryBtn = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 2,
  border: "none",
  background: COLORS.black,
  color: "#fff",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: FONTS.body,
};

const ghostBtn = {
  border: "none",
  background: "none",
  color: COLORS.ink,
  cursor: "pointer",
  padding: 0,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "underline",
  fontFamily: FONTS.body,
};

const card = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 2,
  padding: "1.75rem",
};

const wrap = {
  minHeight: "100vh",
  background: COLORS.bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
  fontFamily: FONTS.body,
  textAlign: "left",
};

function extrude(steps) {
  const l = [];
  for (let i = 1; i <= steps; i++) {
    const v = Math.round(205 + (i / steps) * 33);
    l.push(`-${i}px -${i}px 0 rgb(${v},${v},${v})`);
  }
  return l.join(", ");
}

function AppHeader() {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label, margin: "0 0 6px" }}>
        Shift &amp; earnings ledger
      </p>
      <h1
        style={{
          fontFamily: FONTS.display,
          fontWeight: 400,
          fontSize: "clamp(30px, 9vw, 38px)",
          lineHeight: 1,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          color: COLORS.ink,
          margin: 0,
          textShadow: extrude(9),
        }}
      >
        Zero Contract
      </h1>
      <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: COLORS.inkSoft, margin: "12px 0 0" }}>
        Track your shifts, earnings and tax estimate.
      </p>
    </div>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return <p style={{ fontFamily: FONTS.body, color: COLORS.danger, fontSize: 13, marginBottom: 14, lineHeight: 1.4 }}>{msg}</p>;
}
function InfoMsg({ msg }) {
  if (!msg) return null;
  return <p style={{ fontFamily: FONTS.body, color: COLORS.ink, fontSize: 13, marginBottom: 14, lineHeight: 1.4 }}>{msg}</p>;
}

export default function AuthScreen({ onShowPrivacy }) {
  const [mode, setMode] = useState("login");
  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <AppHeader />
        {mode === "login" && <LoginForm onSwitch={setMode} onShowPrivacy={onShowPrivacy} />}
        {mode === "signup" && <SignupForm onSwitch={setMode} onShowPrivacy={onShowPrivacy} />}
        {mode === "forgot" && <ForgotForm onSwitch={setMode} />}
        {mode === "confirm" && <ConfirmScreen onSwitch={setMode} />}
      </div>
    </div>
  );
}

function LoginForm({ onSwitch, onShowPrivacy }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("invalid login") || error.message.toLowerCase().includes("invalid credentials")) {
        setError("Email or password is incorrect. Try again or reset your password below.");
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("You haven't confirmed your email yet. Check your inbox for a confirmation link.");
      } else {
        setError(error.message);
      }
    }
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} style={card}>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabel}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="you@example.com" />
      </div>
      <div style={{ marginBottom: 6 }}>
        <label style={fieldLabel}>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inp} />
      </div>
      <div style={{ textAlign: "right", marginBottom: 18 }}>
        <button type="button" onClick={() => onSwitch("forgot")} style={{ ...ghostBtn, fontSize: 12, fontWeight: 400, color: COLORS.inkSoft }}>
          Forgot password?
        </button>
      </div>
      <ErrorMsg msg={error} />
      <button type="submit" disabled={busy} style={primaryBtn}>{busy ? "Logging in..." : "Log in"}</button>
      <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 16, textAlign: "center" }}>
        New here? <button type="button" onClick={() => onSwitch("signup")} style={ghostBtn}>Create an account</button>
      </p>
      <p style={{ fontSize: 12, marginTop: 10, textAlign: "center" }}>
        <button type="button" onClick={onShowPrivacy} style={{ ...ghostBtn, fontSize: 12, fontWeight: 400, color: COLORS.label }}>Privacy Policy</button>
      </p>
    </form>
  );
}

function SignupForm({ onSwitch, onShowPrivacy }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profession, setProfession] = useState("");
  const [taxRegion, setTaxRegion] = useState("rest_of_uk");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !profession.trim()) {
      setError("Please fill in your name and profession.");
      return;
    }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!consent) { setError("You need to accept the privacy policy to create an account."); return; }
    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already registered") || signUpError.message.toLowerCase().includes("already exists")) {
        setError("An account with that email already exists. Try logging in instead.");
      } else {
        setError(signUpError.message);
      }
      setBusy(false);
      return;
    }

    sessionStorage.setItem("zc_pending_profile", JSON.stringify({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      profession: profession.trim(),
      tax_region: taxRegion,
    }));

    if (data.session && data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        profession: profession.trim(),
        tax_region: taxRegion,
        privacy_consent: true,
        privacy_consent_at: new Date().toISOString(),
      });
    } else {
      onSwitch("confirm");
    }
    setBusy(false);
  };

  const selectStyle = { ...inp, appearance: "none", cursor: "pointer" };

  return (
    <form onSubmit={handleSubmit} style={{ ...card, maxHeight: "85vh", overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={fieldLabel}>First name</label>
          <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={fieldLabel}>Last name</label>
          <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} style={inp} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabel}>Profession</label>
        <input type="text" required placeholder="e.g. Security, Bar staff, Driver" value={profession} onChange={(e) => setProfession(e.target.value)} style={inp} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabel}>Tax region</label>
        <select value={taxRegion} onChange={(e) => setTaxRegion(e.target.value)} style={selectStyle}>
          <option value="rest_of_uk">England, Wales or Northern Ireland</option>
          <option value="scotland">Scotland</option>
          <option value="skip">I'll set this later</option>
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabel}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="you@example.com" />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabel}>Password (min. 8 characters)</label>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={inp} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={fieldLabel}>Confirm password</label>
        <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inp} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.4, cursor: "pointer" }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
          <span>
            I've read and accept the{" "}
            <button type="button" onClick={onShowPrivacy} style={{ ...ghostBtn, fontSize: 12.5 }}>Privacy Policy</button>
            , and understand how my data is used.
          </span>
        </label>
      </div>
      <ErrorMsg msg={error} />
      <button type="submit" disabled={busy} style={primaryBtn}>{busy ? "Creating account..." : "Create account"}</button>
      <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 16, textAlign: "center" }}>
        Already have an account? <button type="button" onClick={() => onSwitch("login")} style={ghostBtn}>Log in</button>
      </p>
    </form>
  );
}

function ConfirmScreen({ onSwitch }) {
  return (
    <div style={card}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.black, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <span style={{ color: "#fff", fontSize: 22 }}>&#10003;</span>
        </div>
        <h2 style={{ fontFamily: FONTS.body, fontSize: 20, fontWeight: 700, color: COLORS.ink, margin: "0 0 8px" }}>Check your email</h2>
        <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.6, margin: 0 }}>
          We've sent a confirmation link to your inbox. Click it to activate your account, then come back here to log in.
        </p>
      </div>
      <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 2, padding: "12px 14px", marginBottom: 20 }}>
        <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>
          Can't find it? Check your spam or junk folder. The email comes from noreply@mail.app.supabase.io.
        </p>
      </div>
      <button onClick={() => onSwitch("login")} style={primaryBtn}>Back to log in</button>
    </div>
  );
}

function ForgotForm({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://zero-contract.vercel.app/reset-password",
    });
    if (error) setError("Something went wrong. Please try again in a few minutes.");
    else setInfo("If that email has an account, a reset link is on its way. Check your inbox and spam folder.");
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} style={card}>
      <h2 style={{ fontFamily: FONTS.body, fontSize: 18, fontWeight: 700, color: COLORS.ink, margin: "0 0 8px" }}>Reset your password</h2>
      <p style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.5 }}>
        Enter your email and we'll send a reset link if an account exists.
      </p>
      <div style={{ marginBottom: 18 }}>
        <label style={fieldLabel}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="you@example.com" />
      </div>
      <ErrorMsg msg={error} />
      <InfoMsg msg={info} />
      <button type="submit" disabled={busy} style={primaryBtn}>{busy ? "Sending..." : "Send reset link"}</button>
      <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 16, textAlign: "center" }}>
        <button type="button" onClick={() => onSwitch("login")} style={ghostBtn}>Back to log in</button>
      </p>
    </form>
  );
}
