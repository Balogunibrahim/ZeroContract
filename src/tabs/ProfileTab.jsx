import { useState, useEffect, useRef, useId, cloneElement, isValidElement } from "react";
import {
  PoundSterling,
  Clock,
  Bell,
  CreditCard,
  MapPin,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react";
import {
  getCurrentSubscriptionStatus,
  enablePushNotifications,
  disablePushNotifications,
  isIOS,
  isStandalone,
} from "../utils/pushNotifications";
import { attachAutocomplete } from "../utils/mapsUtils";
import { COLORS, FONTS, ScreenLabel, cardStyle, formatMoney, LogoMark } from "../theme";

export default function ProfileTab({ profile, session, onSave, onShowPrivacy, onLogout }) {
  const email = session?.user?.email || "—";
  const firstName = profile?.first_name || "";
  const lastName = profile?.last_name || "";
  const displayName = `${firstName} ${lastName}`.trim() || "Your account";
  const initial = (firstName || email || "?").charAt(0).toUpperCase();

  // Settings live in profiles.settings (jsonb). Keep a local optimistic mirror.
  const [local, setLocal] = useState(profile?.settings || {});
  useEffect(() => setLocal(profile?.settings || {}), [profile]);

  const [modal, setModal] = useState(null); // 'profile' | 'pay' | 'overtime' | 'prefs'
  const [pushStatus, setPushStatus] = useState("checking");
  const [pushErr, setPushErr] = useState("");

  useEffect(() => {
    getCurrentSubscriptionStatus().then(setPushStatus);
  }, []);

  // --- persistence helpers ---
  const persistSettings = async (patch) => {
    const next = { ...local, ...patch };
    setLocal(next); // optimistic
    return onSave({ settings: next });
  };

  const shiftRemindersOn = pushStatus === "subscribed";
  const iosNotInstalled = isIOS() && !isStandalone();

  const toggleShiftReminders = async () => {
    setPushErr("");
    try {
      if (shiftRemindersOn) {
        await disablePushNotifications(session?.user?.id);
        setPushStatus("not-subscribed");
      } else {
        await enablePushNotifications(session?.user?.id);
        setPushStatus("subscribed");
      }
    } catch (e) {
      setPushErr(e.message || "Couldn't change reminders.");
    }
  };

  const weeklyOn = local.weeklySummary ?? true;
  const travelOn = local.travelAuto ?? true;

  // --- derived subtitles ---
  const paySub =
    local.baseRate
      ? `Base ${formatMoney(local.baseRate)}${local.nightRate ? ` · nights ${formatMoney(local.nightRate)}` : ""}`
      : "Set your hourly rates";
  const otSub = local.otMultiplier
    ? `${local.otMultiplier}x after ${local.otAfterHours || 8} hours`
    : "Not set up yet";
  const prefsSub = "Currency, week start, theme";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1.25rem calc(6rem + env(safe-area-inset-bottom, 0px))" }}>
      <ScreenLabel>Account</ScreenLabel>
      <h1
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: "clamp(28px,7.5vw,38px)",
          letterSpacing: "-0.02em",
          color: COLORS.ink,
          margin: "4px 0 22px",
        }}
      >
        Settings
      </h1>

      {/* Profile card */}
      <button onClick={() => setModal("profile")} style={{ ...cardStyle, borderRadius: 22, padding: "18px 18px", width: "100%", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", textAlign: "left", marginBottom: 26 }}>
        <div
          style={{
            width: 60,
            height: 60,
            flex: "0 0 60px",
            borderRadius: 18,
            background: "linear-gradient(135deg,#0A7B57,#0B3D2E)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.ink, letterSpacing: "-0.01em" }}>
            {displayName}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, marginTop: 2, wordBreak: "break-word" }}>
            {email}
          </div>
        </div>
      </button>

      {/* EARNINGS */}
      <Section title="Earnings">
        <Row icon={PoundSterling} title="Pay rates" subtitle={paySub} onClick={() => setModal("pay")} right={<ChevronRight size={18} color={COLORS.label} />} first />
        <Row icon={Clock} title="Overtime rules" subtitle={otSub} onClick={() => setModal("overtime")} right={<ChevronRight size={18} color={COLORS.label} />} />
      </Section>

      {/* REMINDERS */}
      <Section title="Reminders">
        <Row
          icon={Bell}
          title="Shift reminders"
          subtitle={iosNotInstalled ? "Add to home screen to enable" : "1 hour before each shift"}
          first
          right={<Switch on={shiftRemindersOn} onClick={toggleShiftReminders} disabled={iosNotInstalled || pushStatus === "checking" || pushStatus === "denied"} />}
        />
        <Row icon={CreditCard} title="Weekly earnings summary" subtitle="Sundays at 6pm" right={<Switch on={weeklyOn} onClick={() => persistSettings({ weeklySummary: !weeklyOn })} />} />
        <Row icon={MapPin} title="Travel & maps" subtitle="Auto estimate journey cost" right={<Switch on={travelOn} onClick={() => persistSettings({ travelAuto: !travelOn })} />} />
      </Section>
      {pushErr && <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.danger, margin: "-12px 2px 20px" }}>{pushErr}</p>}

      {/* ACCOUNT */}
      <Section title="Account">
        <Row icon={SettingsIcon} title="Preferences" subtitle={prefsSub} onClick={() => setModal("prefs")} right={<ChevronRight size={18} color={COLORS.label} />} first />
      </Section>

      {/* Sign out */}
      <button
        onClick={onLogout}
        style={{
          ...cardStyle,
          borderRadius: 18,
          width: "100%",
          padding: "16px",
          textAlign: "center",
          cursor: "pointer",
          fontFamily: FONTS.display,
          fontSize: 16,
          fontWeight: 700,
          color: COLORS.danger,
        }}
      >
        Sign out
      </button>

      <div style={{ textAlign: "center", marginTop: 14 }}>
        <button onClick={onShowPrivacy} style={{ border: "none", background: "none", color: COLORS.inkSoft, fontFamily: FONTS.body, fontSize: 12.5, textDecoration: "underline", cursor: "pointer" }}>
          Privacy Policy
        </button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 8 }}>
          <LogoMark size={34} />
        </div>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: COLORS.ink }}>
          Zero<span style={{ color: COLORS.brand }}>Contract</span>
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.label, marginTop: 4 }}>Version 1.0.0</div>
      </div>

      {/* --- Modals --- */}
      {modal === "profile" && (
        <ProfileEditor
          initial={{ firstName, lastName, profession: profile?.profession || "", homeAddress: profile?.home_address || "" }}
          onClose={() => setModal(null)}
          onSubmit={async (v) => onSave({ first_name: v.firstName.trim(), last_name: v.lastName.trim(), profession: v.profession.trim(), home_address: v.homeAddress.trim() })}
        />
      )}
      {modal === "pay" && (
        <PayEditor
          initial={{ baseRate: local.baseRate || "", nightRate: local.nightRate || "" }}
          onClose={() => setModal(null)}
          onSubmit={(v) => persistSettings({ baseRate: num(v.baseRate), nightRate: num(v.nightRate) })}
        />
      )}
      {modal === "overtime" && (
        <OvertimeEditor
          initial={{ otMultiplier: local.otMultiplier || "1.5", otAfterHours: local.otAfterHours || "8" }}
          onClose={() => setModal(null)}
          onSubmit={(v) => persistSettings({ otMultiplier: num(v.otMultiplier), otAfterHours: num(v.otAfterHours) })}
        />
      )}
      {modal === "prefs" && (
        <PrefsEditor
          initial={{
            currency: local.currency || "GBP",
            weekStart: local.weekStart || "Mon",
            theme: local.theme || "system",
            taxRegion: profile?.tax_region || "rest_of_uk",
            otherIncome: String(profile?.other_income || "0"),
            taxCode: local.taxCode || "",
            employment: local.employment || "employed",
            studentLoan: local.studentLoan || "none",
            pensionPct: local.pensionPct != null ? String(local.pensionPct) : "",
          }}
          onClose={() => setModal(null)}
          onSubmit={async (v) => {
            const next = {
              ...local,
              currency: v.currency,
              weekStart: v.weekStart,
              theme: v.theme,
              taxCode: v.taxCode ? v.taxCode.trim() : "",
              employment: v.employment,
              studentLoan: v.studentLoan,
              pensionPct: num(v.pensionPct),
            };
            setLocal(next);
            return onSave({ tax_region: v.taxRegion, other_income: num(v.otherIncome), settings: next });
          }}
        />
      )}
    </div>
  );
}

const num = (v) => parseFloat(v) || 0;

// ---------- layout pieces ----------

const sectionLabel = {
  fontFamily: FONTS.body,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: COLORS.label,
};

function Section({ title, children }) {
  return (
    <div style={{ ...cardStyle, borderRadius: 20, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "14px 18px 12px" }}>
        <span style={sectionLabel}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ icon: Icon, title, subtitle, onClick, right, first }) {
  const inner = (
    <>
      <div style={{ width: 40, height: 40, flex: "0 0 40px", borderRadius: 12, background: COLORS.tint, color: COLORS.brand, display: "grid", placeItems: "center" }}>
        <Icon size={20} strokeWidth={1.9} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 15.5, fontWeight: 600, color: COLORS.ink }}>{title}</div>
        {subtitle && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginTop: 2, wordBreak: "break-word" }}>{subtitle}</div>}
      </div>
      {right}
    </>
  );
  const base = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 16px",
    borderTop: first ? "none" : `1px solid ${COLORS.line}`,
    width: "100%",
  };
  return onClick ? (
    <button onClick={onClick} style={{ ...base, background: "none", border: "none", borderTop: base.borderTop, cursor: "pointer", textAlign: "left" }}>
      {inner}
    </button>
  ) : (
    <div style={base}>{inner}</div>
  );
}

function Switch({ on, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        border: "none",
        background: on ? COLORS.brand : "#cfccc4",
        padding: 3,
        display: "inline-flex",
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 150ms",
        flexShrink: 0,
      }}
    >
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.card, transform: on ? "translateX(20px)" : "translateX(0)", transition: "transform 150ms", boxShadow: "0 1px 2px rgba(0,0,0,.25)" }} />
    </button>
  );
}

// ---------- modal shell ----------

function Modal({ title, onClose, children, onSubmit }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    setSaving(true);
    setErr("");
    const msg = await onSubmit();
    setSaving(false);
    if (msg) setErr(typeof msg === "string" ? msg : "Couldn't save. Try again.");
    else onClose();
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(11,61,46,.35)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 560, padding: "22px 20px calc(24px + env(safe-area-inset-bottom,0px))", boxShadow: "0 -12px 40px -12px rgba(11,61,46,.4)" }}>
        <h3 style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, color: COLORS.ink, margin: "0 0 16px" }}>{title}</h3>
        {children}
        {err && <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.danger, margin: "12px 0 0" }}>{err}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={submit} disabled={saving} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: COLORS.deep, color: "#fff", fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} style={{ padding: "13px 22px", borderRadius: 14, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.ink, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldLabel = { fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: COLORS.label, display: "block", marginBottom: 6 };
const input = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 12, background: COLORS.card, fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink, outline: "none" };

function Field({ label, children }) {
  const id = useId();
  const child = isValidElement(children) ? cloneElement(children, { id }) : children;
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id} style={fieldLabel}>{label}</label>
      {child}
    </div>
  );
}

// ---------- editors ----------

function ProfileEditor({ initial, onClose, onSubmit }) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [profession, setProfession] = useState(initial.profession);
  const [homeAddress, setHomeAddress] = useState(initial.homeAddress);
  const addrRef = useRef(null);
  useEffect(() => {
    if (addrRef.current) attachAutocomplete(addrRef.current, (a) => setHomeAddress(a));
  }, []);
  return (
    <Modal title="Edit profile" onClose={onClose} onSubmit={() => onSubmit({ firstName, lastName, profession, homeAddress })}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="First name"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={input} /></Field>
        <Field label="Last name"><input value={lastName} onChange={(e) => setLastName(e.target.value)} style={input} /></Field>
      </div>
      <Field label="Profession"><input value={profession} onChange={(e) => setProfession(e.target.value)} style={input} /></Field>
      <Field label="Home address"><input ref={addrRef} placeholder="Start typing your address..." value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} style={input} /></Field>
    </Modal>
  );
}

function PayEditor({ initial, onClose, onSubmit }) {
  const [baseRate, setBaseRate] = useState(initial.baseRate);
  const [nightRate, setNightRate] = useState(initial.nightRate);
  return (
    <Modal title="Pay rates" onClose={onClose} onSubmit={() => onSubmit({ baseRate, nightRate })}>
      <Field label="Base rate (£/hr)"><input type="number" step="0.01" value={baseRate} onChange={(e) => setBaseRate(e.target.value)} style={input} /></Field>
      <Field label="Night rate (£/hr)"><input type="number" step="0.01" value={nightRate} onChange={(e) => setNightRate(e.target.value)} style={input} /></Field>
    </Modal>
  );
}

function OvertimeEditor({ initial, onClose, onSubmit }) {
  const [otMultiplier, setOtMultiplier] = useState(initial.otMultiplier);
  const [otAfterHours, setOtAfterHours] = useState(initial.otAfterHours);
  return (
    <Modal title="Overtime rules" onClose={onClose} onSubmit={() => onSubmit({ otMultiplier, otAfterHours })}>
      <Field label="Multiplier (e.g. 1.5)"><input type="number" step="0.1" value={otMultiplier} onChange={(e) => setOtMultiplier(e.target.value)} style={input} /></Field>
      <Field label="After how many hours"><input type="number" step="1" value={otAfterHours} onChange={(e) => setOtAfterHours(e.target.value)} style={input} /></Field>
    </Modal>
  );
}

function PrefsEditor({ initial, onClose, onSubmit }) {
  const [currency, setCurrency] = useState(initial.currency);
  const [weekStart, setWeekStart] = useState(initial.weekStart);
  const [theme, setTheme] = useState(initial.theme);
  const [taxRegion, setTaxRegion] = useState(initial.taxRegion);
  const [otherIncome, setOtherIncome] = useState(initial.otherIncome);
  const [taxCode, setTaxCode] = useState(initial.taxCode || "");
  const [employment, setEmployment] = useState(initial.employment || "employed");
  const [studentLoan, setStudentLoan] = useState(initial.studentLoan || "none");
  const [pensionPct, setPensionPct] = useState(initial.pensionPct || "");
  const select = { ...input, appearance: "none", cursor: "pointer" };
  return (
    <Modal title="Preferences" onClose={onClose} onSubmit={() => onSubmit({ currency, weekStart, theme, taxRegion, otherIncome, taxCode, employment, studentLoan, pensionPct })}>
      <Field label="Currency">
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={select}>
          <option value="GBP">£ GBP</option>
          <option value="EUR">€ EUR</option>
          <option value="USD">$ USD</option>
        </select>
      </Field>
      <Field label="Week starts on">
        <select value={weekStart} onChange={(e) => setWeekStart(e.target.value)} style={select}>
          <option value="Mon">Monday</option>
          <option value="Sun">Sunday</option>
        </select>
      </Field>
      <Field label="Theme">
        <select value={theme} onChange={(e) => setTheme(e.target.value)} style={select}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Field>

      <p style={{ ...sectionLabel, margin: "8px 0 12px" }}>For an accurate tax estimate</p>
      <Field label="Tax region">
        <select value={taxRegion} onChange={(e) => setTaxRegion(e.target.value)} style={select}>
          <option value="rest_of_uk">England, Wales or Northern Ireland</option>
          <option value="scotland">Scotland</option>
          <option value="skip">Prefer not to say</option>
        </select>
      </Field>
      <Field label="Tax code (from your payslip)"><input type="text" placeholder="e.g. 1257L" value={taxCode} onChange={(e) => setTaxCode(e.target.value.toUpperCase())} style={input} /></Field>
      <Field label="Employment">
        <select value={employment} onChange={(e) => setEmployment(e.target.value)} style={select}>
          <option value="employed">Employed (PAYE)</option>
          <option value="self_employed">Self-employed</option>
        </select>
      </Field>
      <Field label="Student loan">
        <select value={studentLoan} onChange={(e) => setStudentLoan(e.target.value)} style={select}>
          <option value="none">None</option>
          <option value="plan1">Plan 1</option>
          <option value="plan2">Plan 2</option>
          <option value="plan4">Plan 4 (Scotland)</option>
          <option value="plan5">Plan 5</option>
          <option value="postgrad">Postgraduate</option>
        </select>
      </Field>
      <Field label="Pension contribution (%)"><input type="number" step="0.5" min="0" placeholder="e.g. 5" value={pensionPct} onChange={(e) => setPensionPct(e.target.value)} style={input} /></Field>
      <Field label="Other annual income (£)"><input type="number" step="100" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} style={input} /></Field>
    </Modal>
  );
}
