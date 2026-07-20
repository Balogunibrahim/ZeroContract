import { useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { COLORS, FONTS, LogoLockup } from "../theme";

const SHELL_BG = "radial-gradient(120% 70% at 50% 0%,#123f30,#0d2c22 60%,#0a211a)";

const STYLE = `
  .zc-inp{width:100%;padding:11px 13px;border:1px solid ${COLORS.border};border-radius:12px;
    background:#fff;font-family:'Inter',sans-serif;font-size:14px;color:${COLORS.ink};outline:none;
    box-sizing:border-box;transition:border-color .15s,box-shadow .15s}
  .zc-inp:focus{border-color:${COLORS.brand};box-shadow:0 0 0 3px rgba(10,123,87,.12)}
  .zc-inp::placeholder{color:#B7C0BA}
  select.zc-inp{appearance:none;-webkit-appearance:none;cursor:pointer;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235E6B63' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 13px center;padding-right:34px}
  .zc-scroll::-webkit-scrollbar{display:none}
`;

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

const linkBtn = {
  border: "none",
  background: "none",
  color: COLORS.brand,
  cursor: "pointer",
  fontWeight: 600,
  fontFamily: FONTS.body,
  fontSize: 12.5,
  padding: 0,
};

async function oauth(provider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  return error ? error.message : null;
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.9 35.3 44 30 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="#111" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.24 3-.87.86-2 1.53-3.16 1.44-.12-1.14.44-2.34 1.19-3.09.83-.85 2.2-1.47 3.21-1.35zM20.6 17.02c-.55 1.27-.82 1.84-1.53 2.96-.99 1.57-2.39 3.52-4.12 3.53-1.54.02-1.94-1-4.03-.99-2.09.01-2.52 1.01-4.06.99-1.73-.02-3.05-1.78-4.04-3.35C-.02 15.9-.4 10.6 1.8 7.82c1.03-1.32 2.66-2.16 4.2-2.16 1.57 0 2.56 1.02 3.86 1.02 1.26 0 2.03-1.02 3.85-1.02 1.37 0 2.83.75 3.86 2.04-3.39 1.86-2.84 6.7.03 8.32z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08V12h3.05V9.41c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.93-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38C19.61 22.95 24 17.99 24 12z" />
    </svg>
  );
}

function SocialBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ flex: 1, height: 48, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
    >
      {children}
    </button>
  );
}

function SocialRow() {
  const [err, setErr] = useState("");
  const go = async (p) => {
    setErr("");
    const msg = await oauth(p);
    if (msg) setErr("Couldn't start sign-in. This provider may not be enabled yet.");
  };
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: COLORS.label }}>or continue with</span>
        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <SocialBtn label="Continue with Google" onClick={() => go("google")}><GoogleIcon /></SocialBtn>
        <SocialBtn label="Continue with Apple" onClick={() => go("apple")}><AppleIcon /></SocialBtn>
        <SocialBtn label="Continue with Facebook" onClick={() => go("facebook")}><FacebookIcon /></SocialBtn>
      </div>
      {err && <p style={{ fontFamily: FONTS.body, color: COLORS.danger, fontSize: 12, margin: "10px 0 0", lineHeight: 1.45 }}>{err}</p>}
    </div>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return <p style={{ fontFamily: FONTS.body, color: COLORS.danger, fontSize: 12.5, margin: "0 0 12px", lineHeight: 1.45 }}>{msg}</p>;
}
function InfoMsg({ msg }) {
  if (!msg) return null;
  return <p style={{ fontFamily: FONTS.body, color: COLORS.brand, fontSize: 12.5, margin: "0 0 12px", lineHeight: 1.45, background: COLORS.tint, borderRadius: 10, padding: "9px 12px" }}>{msg}</p>;
}

// Card with the branded green header on top and a scrollable body below.
function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", background: SHELL_BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: FONTS.body, textAlign: "left" }}>
      <style>{STYLE}</style>
      <div style={{ width: "100%", maxWidth: 420, background: COLORS.bg, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 60px -22px rgba(0,0,0,.6)", display: "flex", flexDirection: "column", maxHeight: "94vh" }}>
        <div style={{ background: "linear-gradient(150deg,#0B4835,#0B3D2E 75%,#092b21)", padding: "30px 24px 26px", color: "#fff", position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ position: "absolute", right: -30, top: -40, width: 150, height: 150, background: "radial-gradient(circle,rgba(224,160,43,.22),transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "relative" }}>
            <LogoLockup size={28} dark />
          </div>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 23, fontWeight: 700, letterSpacing: "-0.02em", margin: "18px 0 4px", position: "relative" }}>{title}</h2>
          <p style={{ fontSize: 12.5, color: "#BFE0D3", position: "relative", margin: 0 }}>{subtitle}</p>
        </div>
        <div className="zc-scroll" style={{ overflowY: "auto", padding: "20px 22px 24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AuthScreen({ onShowPrivacy }) {
  const [mode, setMode] = useState("login");
  if (mode === "signup") return <SignupForm onSwitch={setMode} onShowPrivacy={onShowPrivacy} />;
  if (mode === "forgot") return <ForgotForm onSwitch={setMode} />;
  if (mode === "confirm") return <ConfirmScreen onSwitch={setMode} />;
  return <LoginForm onSwitch={setMode} onShowPrivacy={onShowPrivacy} />;
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
      const m = error.message.toLowerCase();
      if (m.includes("invalid login") || m.includes("invalid credentials")) {
        setError("Email or password is incorrect. Try again or reset your password below.");
      } else if (m.includes("email not confirmed")) {
        setError("You haven't confirmed your email yet. Check your inbox for a confirmation link.");
      } else {
        setError(error.message);
      }
    }
    setBusy(false);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see your earnings">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 13 }}>
          <label style={flabel}>Email</label>
          <input className="zc-inp" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div style={{ marginBottom: 6 }}>
          <label style={flabel}>Password</label>
          <input className="zc-inp" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ textAlign: "right", marginBottom: 14 }}>
          <button type="button" onClick={() => onSwitch("forgot")} style={{ ...linkBtn, color: COLORS.inkSoft, fontWeight: 400, fontSize: 12 }}>
            Forgot password?
          </button>
        </div>
        <ErrorMsg msg={error} />
        <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>{busy ? "Logging in…" : "Log in"}</button>
        <SocialRow />
        <p style={{ textAlign: "center", fontSize: 12.5, color: COLORS.inkSoft, marginTop: 18 }}>
          New here? <button type="button" onClick={() => onSwitch("signup")} style={linkBtn}>Create an account</button>
        </p>
        <p style={{ textAlign: "center", fontSize: 12, marginTop: 10 }}>
          <button type="button" onClick={onShowPrivacy} style={{ ...linkBtn, fontWeight: 400, color: COLORS.label, fontSize: 12 }}>Privacy Policy</button>
        </p>
      </form>
    </AuthShell>
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
      const m = signUpError.message.toLowerCase();
      if (m.includes("already registered") || m.includes("already exists")) {
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

  return (
    <AuthShell title="Create account" subtitle="Start tracking in two minutes">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 10, marginBottom: 13 }}>
          <div style={{ flex: 1 }}>
            <label style={flabel}>First name</label>
            <input className="zc-inp" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={flabel}>Last name</label>
            <input className="zc-inp" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 13 }}>
          <label style={flabel}>Profession</label>
          <input className="zc-inp" type="text" required placeholder="e.g. Security, Bar staff, Driver" value={profession} onChange={(e) => setProfession(e.target.value)} />
        </div>
        <div style={{ marginBottom: 13 }}>
          <label style={flabel}>Email</label>
          <input className="zc-inp" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div style={{ marginBottom: 13 }}>
          <label style={flabel}>Tax region</label>
          <select className="zc-inp" value={taxRegion} onChange={(e) => setTaxRegion(e.target.value)}>
            <option value="rest_of_uk">England, Wales &amp; NI</option>
            <option value="scotland">Scotland</option>
            <option value="skip">Rather not say</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 13 }}>
          <div style={{ flex: 1 }}>
            <label style={flabel}>Password</label>
            <input className="zc-inp" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={flabel}>Confirm</label>
            <input className="zc-inp" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <label style={{ display: "flex", gap: 9, alignItems: "flex-start", margin: "4px 0 8px", fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, accentColor: COLORS.brand }} />
          <span>
            I've read and accept the{" "}
            <button type="button" onClick={onShowPrivacy} style={linkBtn}>Privacy Policy</button>.
          </span>
        </label>
        <ErrorMsg msg={error} />
        <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>{busy ? "Creating account…" : "Create account"}</button>
        <SocialRow />
        <p style={{ textAlign: "center", fontSize: 11.5, color: COLORS.label, marginTop: 12, lineHeight: 1.5 }}>
          By continuing with Google, Apple or Facebook you agree to the{" "}
          <button type="button" onClick={onShowPrivacy} style={{ ...linkBtn, fontSize: 11.5 }}>Privacy Policy</button>.
        </p>
        <p style={{ textAlign: "center", fontSize: 12.5, color: COLORS.inkSoft, marginTop: 14 }}>
          Already have an account? <button type="button" onClick={() => onSwitch("login")} style={linkBtn}>Log in</button>
        </p>
      </form>
    </AuthShell>
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
    <AuthShell title="Reset password" subtitle="We'll email you a secure link">
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 16 }}>
          Enter the email you signed up with and we'll send a link to set a new password.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label style={flabel}>Email</label>
          <input className="zc-inp" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <ErrorMsg msg={error} />
        <InfoMsg msg={info} />
        <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>{busy ? "Sending…" : "Send reset link"}</button>
        <p style={{ textAlign: "center", fontSize: 12.5, color: COLORS.inkSoft, marginTop: 16 }}>
          <button type="button" onClick={() => onSwitch("login")} style={linkBtn}>← Back to log in</button>
        </p>
      </form>
    </AuthShell>
  );
}

function ConfirmScreen({ onSwitch }) {
  return (
    <div style={{ minHeight: "100vh", background: SHELL_BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: FONTS.body }}>
      <div style={{ width: "100%", maxWidth: 420, background: COLORS.bg, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 60px -22px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "44px 30px" }}>
          <div style={{ width: 76, height: 76, borderRadius: 24, background: COLORS.tint, display: "grid", placeItems: "center", color: COLORS.brand, marginBottom: 22 }}>
            <Mail size={36} strokeWidth={1.8} />
          </div>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 21, fontWeight: 700, color: COLORS.ink, margin: "0 0 10px" }}>Check your email</h2>
          <p style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.6, margin: 0 }}>
            We've sent a confirmation link to your inbox. Tap it to activate your account, then come back and log in.
          </p>
          <p style={{ fontSize: 12, color: COLORS.label, marginTop: 14, marginBottom: 24 }}>
            Can't find it? Check your spam or junk folder.
          </p>
          <button onClick={() => onSwitch("login")} style={{ ...primaryBtn, maxWidth: 220, marginTop: 0 }}>Back to log in</button>
        </div>
      </div>
    </div>
  );
}
