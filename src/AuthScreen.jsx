import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import PrivacyPolicy from "./PrivacyPolicy";

const COLORS = {
  navy: "#15203B",
  paper: "#F7F3EC",
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  amberDeep: "#C97F1E",
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

const ghostButtonStyle = {
  border: "none",
  background: "none",
  color: COLORS.amber,
  cursor: "pointer",
  padding: 0,
  fontSize: 13,
  textDecoration: "underline",
  fontFamily: FONT_BODY,
};

const wrapStyle = {
  minHeight: "100vh",
  background: COLORS.navy,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
  fontFamily: FONT_BODY,
};

const cardStyle = {
  background: COLORS.paper,
  borderRadius: 6,
  padding: "1.75rem",
  boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
};

function Header() {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>
        SHIFT &amp; EARNINGS LEDGER
      </p>
      <h1 style={{ color: COLORS.offwhite, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, margin: 0, letterSpacing: -0.5 }}>
        Zero Contract
      </h1>
    </div>
  );
}

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setMode("reset");
    }
  }, []);

  const switchMode = (m) => setMode(m);

  return (
    <>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      <div style={wrapStyle}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <Header />
          {mode === "login" && <LoginForm onSwitch={switchMode} onShowPrivacy={() => setShowPrivacy(true)} />}
          {mode === "signup" && <SignupForm onSwitch={switchMode} onShowPrivacy={() => setShowPrivacy(true)} />}
          {mode === "forgot" && <ForgotForm onSwitch={switchMode} />}
          {mode === "reset" && <ResetForm onSwitch={switchMode} />}
        </div>
      </div>
    </>
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
    if (error) setError(error.message);
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={fieldLabelStyle}>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ textAlign: "right", marginBottom: 18 }}>
        <button type="button" onClick={() => onSwitch("forgot")} style={{ ...ghostButtonStyle, fontSize: 12, color: COLORS.inkSoft }}>
          Forgot password?
        </button>
      </div>
      {error && <p style={{ color: COLORS.clay, fontSize: 13, marginBottom: 14 }}>{error}</p>}
      <button type="submit" disabled={busy} style={primaryButtonStyle}>
        {busy ? "Logging in..." : "Log in"}
      </button>
      <p style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 16, textAlign: "center" }}>
        New here?{" "}
        <button type="button" onClick={() => onSwitch("signup")} style={ghostButtonStyle}>Create one</button>
      </p>
      <p style={{ fontSize: 12, color: COLORS.inkSoft, opacity: 0.6, marginTop: 10, textAlign: "center" }}>
        <button type="button" onClick={onShowPrivacy} style={{ ...ghostButtonStyle, fontSize: 12, color: COLORS.inkSoft, opacity: 0.7 }}>
          Privacy Policy
        </button>
      </p>
    </form>
  );
}

function SignupForm({ onSwitch, onShowPrivacy }) {
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
    if (!firstName.trim() || !lastName.trim() || !profession.trim()) {
      setError("First name, last name, and profession are required.");
      return;
    }
    if (!consent) {
      setError("You need to accept the privacy policy to create an account.");
      return;
    }
    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) { setError(signUpError.message); setBusy(false); return; }
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
      sessionStorage.setItem("zc_pending_profile", JSON.stringify({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        profession: profession.trim(),
        tax_region: taxRegion,
      }));
      setInfo("Account created. Check your email to confirm, then log in.");
    }
    setBusy(false);
  };

  const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer" };

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
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
        <input type="text" required placeholder="e.g. Bar staff, Delivery driver" value={profession} onChange={(e) => setProfession(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>Tax region</label>
        <select value={taxRegion} onChange={(e) => setTaxRegion(e.target.value)} style={selectStyle}>
          <option value="rest_of_uk">England, Wales or Northern Ireland</option>
          <option value="scotland">Scotland</option>
          <option value="skip">I'll set this later</option>
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>Password</label>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.4 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
          <span>
            I've read and accept the{" "}
            <button type="button" onClick={onShowPrivacy} style={{ ...ghostButtonStyle, fontSize: 12.5, color: COLORS.amberDeep }}>
              Privacy Policy
            </button>
            , and understand how my data is used.
          </span>
        </label>
      </div>
      {error && <p style={{ color: COLORS.clay, fontSize: 13, marginBottom: 14 }}>{error}</p>}
      {info && <p style={{ color: COLORS.sage, fontSize: 13, marginBottom: 14 }}>{info}</p>}
      <button type="submit" disabled={busy} style={primaryButtonStyle}>
        {busy ? "Creating account..." : "Create account"}
      </button>
      <p style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 16, textAlign: "center" }}>
        Already have an account?{" "}
        <button type="button" onClick={() => onSwitch("login")} style={ghostButtonStyle}>Log in</button>
      </p>
    </form>
  );
}

function ForgotForm({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://zero-contract.vercel.app/reset-password",
    });
    if (error) setError(error.message);
    else setInfo("Check your email for a password reset link. It may take a minute to arrive.");
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <p style={{ fontSize: 14, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.5 }}>
        Enter the email address for your account and we'll send you a reset link.
      </p>
      <div style={{ marginBottom: 18 }}>
        <label style={fieldLabelStyle}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      </div>
      {error && <p style={{ color: COLORS.clay, fontSize: 13, marginBottom: 14 }}>{error}</p>}
      {info && <p style={{ color: COLORS.sage, fontSize: 13, marginBottom: 14 }}>{info}</p>}
      <button type="submit" disabled={busy} style={primaryButtonStyle}>
        {busy ? "Sending..." : "Send reset link"}
      </button>
      <p style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 16, textAlign: "center" }}>
        <button type="button" onClick={() => onSwitch("login")} style={ghostButtonStyle}>Back to log in</button>
      </p>
    </form>
  );
}

function ResetForm({ onSwitch }) {
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
    if (error) setError(error.message);
    else {
      setInfo("Password updated. Logging you in...");
      setTimeout(() => onSwitch("login"), 2000);
    }
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      <p style={{ fontSize: 14, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.5 }}>
        Choose a new password for your account.
      </p>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>New password</label>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={fieldLabelStyle}>Confirm new password</label>
        <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
      </div>
      {error && <p style={{ color: COLORS.clay, fontSize: 13, marginBottom: 14 }}>{error}</p>}
      {info && <p style={{ color: COLORS.sage, fontSize: 13, marginBottom: 14 }}>{info}</p>}
      <button type="submit" disabled={busy} style={primaryButtonStyle}>
        {busy ? "Updating..." : "Set new password"}
      </button>
    </form>
  );
}
