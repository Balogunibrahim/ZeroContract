import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Calendar, Clock, LogOut, X, Settings, WifiOff, AlertCircle } from "lucide-react";
import { supabase } from "./supabaseClient";
import AuthScreen from "./AuthScreen";
import PrivacyPolicy from "./PrivacyPolicy";
import ResetPassword from "./ResetPassword";
import { estimateTax } from "./taxUtils";
import NotificationToggle from "./NotificationToggle";

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
  fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
  color: COLORS.inkSoft, fontFamily: FONT_MONO, display: "block", marginBottom: 6,
};

const inputStyle = {
  width: "100%", padding: "10px 12px", boxSizing: "border-box",
  border: `1px solid ${COLORS.paperDim}`, borderBottom: `2px solid ${COLORS.ink}`,
  borderRadius: 3, background: "white", fontFamily: FONT_BODY,
  fontSize: 15, color: COLORS.ink, outline: "none",
};

const primaryButtonStyle = {
  width: "100%", padding: "12px 16px", borderRadius: 4, border: "none",
  background: COLORS.ink, color: COLORS.offwhite, cursor: "pointer",
  fontSize: 14, fontWeight: 600, letterSpacing: 0.5, fontFamily: FONT_BODY,
};

function todayISO() { return new Date().toISOString().slice(0, 10); }

function formatDate(iso, opts) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, opts || { weekday: "short", month: "short", day: "numeric" });
}

function formatMoney(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "GBP" });
}

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

function ensureFonts() {
  if (document.getElementById("zc-fonts")) return;
  const link = document.createElement("link");
  link.id = "zc-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}

function Spinner() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <p style={{ color: COLORS.offwhite, fontFamily: FONT_MONO, fontSize: 13, letterSpacing: 1, opacity: 0.7 }}>LOADING...</p>
    </div>
  );
}

function NetworkBanner({ offline }) {
  if (!offline) return null;
  return (
    <div style={{ background: COLORS.clay, color: "white", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontFamily: FONT_BODY, fontSize: 13 }}>
      <WifiOff size={15} />
      No internet connection. Your data will sync when you're back online.
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const isPasswordReset = useState(() => window.location.hash.includes("type=recovery"))[0];

  useEffect(() => {
    ensureFonts();

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        setAuthLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (authLoading) return <Spinner />;

  if (isPasswordReset && session) {
    return (
      <>
        {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
        <ResetPassword onDone={() => { window.history.replaceState(null, "", window.location.pathname); }} />
      </>
    );
  }

  return (
    <>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      <NetworkBanner offline={offline} />
      {!session
        ? <AuthScreen onShowPrivacy={() => setShowPrivacy(true)} />
        : <ShiftTracker session={session} onShowPrivacy={() => setShowPrivacy(true)} offline={offline} />
      }
    </>
  );
}

function ShiftTracker({ session, onShowPrivacy, offline }) {
  const [shifts, setShifts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [form, setForm] = useState({
    date: todayISO(), start: "09:00", end: "17:00",
    rate: "", payday: "", paid: false, notes: "",
  });

  const loadAll = async () => {
    setLoadError(false);
    try {
      const [{ data: shiftsData, error: shiftsError }, { data: profileData }] = await Promise.all([
        supabase.from("shifts").select("*").order("date", { ascending: true }),
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      ]);

      if (shiftsError) throw shiftsError;

      if (shiftsData) {
        setShifts(shiftsData.map((s) => ({
          id: s.id, date: s.date,
          start: s.start_time?.slice(0, 5),
          end: s.end_time?.slice(0, 5),
          hours: Number(s.hours), rate: Number(s.rate),
          payday: s.payday, paid: s.paid, notes: s.notes || "",
        })));
        // Show onboarding for brand new users with no shifts
        if (shiftsData.length === 0 && !profileData) setShowOnboarding(true);
      }

      if (profileData) {
        setProfile(profileData);
      } else {
        const pending = sessionStorage.getItem("zc_pending_profile");
        if (pending) {
          const parsed = JSON.parse(pending);
          const { data: newProfile } = await supabase.from("profiles").insert({
            id: session.user.id, ...parsed,
            privacy_consent: true,
            privacy_consent_at: new Date().toISOString(),
          }).select().single();
          if (newProfile) { setProfile(newProfile); sessionStorage.removeItem("zc_pending_profile"); }
        }
        if (shiftsData && shiftsData.length === 0) setShowOnboarding(true);
      }
    } catch (err) {
      setLoadError(true);
    }
    setLoaded(true);
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (showForm) requestAnimationFrame(() => setFormVisible(true));
    else setFormVisible(false);
  }, [showForm]);

  const resetForm = () => {
    setForm({ date: todayISO(), start: "09:00", end: "17:00", rate: "", payday: "", paid: false, notes: "" });
    setEditingId(null);
    setSaveError("");
  };

  const closeForm = () => {
    setFormVisible(false);
    setTimeout(() => setShowForm(false), 180);
  };

  const handleSave = async () => {
    if (!form.date || !form.rate) { setSaveError("Date and hourly rate are required."); return; }
    setSaving(true); setSaveError("");
    try {
      const hours = calcHours(form.start, form.end);
      const row = {
        user_id: session.user.id, date: form.date,
        start_time: form.start, end_time: form.end, hours,
        rate: parseFloat(form.rate) || 0,
        payday: form.payday || null, paid: !!form.paid, notes: form.notes,
      };
      const { error } = editingId
        ? await supabase.from("shifts").update(row).eq("id", editingId)
        : await supabase.from("shifts").insert(row);
      if (error) throw error;
      await loadAll(); resetForm(); closeForm();
      setShowOnboarding(false);
    } catch (err) {
      setSaveError("Couldn't save your shift. Check your connection and try again.");
    }
    setSaving(false);
  };

  const handleEdit = (s) => {
    setForm({ date: s.date, start: s.start, end: s.end, rate: String(s.rate), payday: s.payday || "", paid: s.paid, notes: s.notes || "" });
    setEditingId(s.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("shifts").delete().eq("id", id);
      if (!error) await loadAll();
    } catch (err) {}
  };

  const togglePaid = async (s) => {
    try {
      await supabase.from("shifts").update({ paid: !s.paid }).eq("id", s.id);
      await loadAll();
    } catch (err) {}
  };

  const saveProfile = async (updates) => {
    const { data } = await supabase.from("profiles").update(updates).eq("id", session.user.id).select().single();
    if (data) setProfile(data);
  };

  const today = todayISO();
  const enriched = useMemo(() =>
    shifts.map((s) => ({ ...s, earnings: Math.round(s.hours * s.rate * 100) / 100 }))
      .sort((a, b) => a.date < b.date ? -1 : 1),
    [shifts]);
  const past = enriched.filter((s) => s.date < today);
  const future = enriched.filter((s) => s.date >= today);
  const totalEarned = past.reduce((sum, s) => sum + s.earnings, 0);
  const totalUpcoming = future.reduce((sum, s) => sum + s.earnings, 0);
  const totalUnpaid = enriched.filter((s) => !s.paid && s.date < today).reduce((sum, s) => sum + s.earnings, 0);
  const nextPayday = useMemo(() => {
    const p = enriched.map((s) => s.payday).filter(Boolean).filter((d) => d >= today).sort();
    return p[0] || null;
  }, [enriched, today]);
  const allEarnings = enriched.reduce((sum, s) => sum + s.earnings, 0);
  const taxEstimate = profile ? estimateTax(allEarnings, profile.other_income || 0, profile.tax_region || "rest_of_uk") : null;

  if (!loaded) return <Spinner />;

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: FONT_BODY }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <AlertCircle size={36} color={COLORS.clay} style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: COLORS.ink, marginBottom: 8 }}>Couldn't load your data</h2>
          <p style={{ color: COLORS.inkSoft, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Check your internet connection and try again.</p>
          <button onClick={loadAll} style={{ ...primaryButtonStyle, width: "auto", padding: "10px 24px" }}>Try again</button>
        </div>
      </div>
    );
  }

  const firstName = profile?.first_name || "";

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, fontFamily: FONT_BODY }}>
      {showSettings && (
        <SettingsPanel profile={profile} onSave={saveProfile} onClose={() => setShowSettings(false)} onShowPrivacy={onShowPrivacy} onLogout={() => supabase.auth.signOut()} />
      )}

      {/* Onboarding overlay for new users */}
      {showOnboarding && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(21,32,59,0.92)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: COLORS.paper, borderRadius: 10, padding: "2rem 1.75rem", maxWidth: 360, width: "100%" }}>
            <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, margin: "0 0 8px" }}>WELCOME TO</p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: COLORS.ink, margin: "0 0 16px" }}>Zero Contract</h2>
            <p style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65, marginBottom: 14 }}>
              Track every shift you work, log when you get paid, and see a running estimate of your tax liability.
            </p>
            <div style={{ borderLeft: `3px solid ${COLORS.amber}`, paddingLeft: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: COLORS.ink }}>Past shifts</strong> &mdash; log hours you've already worked and mark them as paid when the money arrives.
              </p>
            </div>
            <div style={{ borderLeft: `3px solid ${COLORS.sage}`, paddingLeft: 14, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: COLORS.ink }}>Upcoming shifts</strong> &mdash; schedule shifts in advance so you can see what's coming in.
              </p>
            </div>
            <button onClick={() => { setShowOnboarding(false); setShowForm(true); }} style={primaryButtonStyle}>
              Add your first shift
            </button>
            <button onClick={() => setShowOnboarding(false)} style={{ width: "100%", marginTop: 10, padding: "10px", border: "none", background: "none", color: COLORS.inkSoft, cursor: "pointer", fontSize: 13, fontFamily: FONT_BODY }}>
              I'll look around first
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: COLORS.navy, padding: "1.5rem 1.25rem 2.5rem" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, margin: 0 }}>ZERO CONTRACT</p>
              {firstName && <p style={{ color: COLORS.offwhite, opacity: 0.55, fontFamily: FONT_BODY, fontSize: 13, margin: "2px 0 0" }}>{firstName}'s ledger</p>}
            </div>
            <button onClick={() => setShowSettings(true)} style={{ border: "none", background: "rgba(255,255,255,0.08)", borderRadius: 5, padding: 8, cursor: "pointer", display: "flex" }} aria-label="Settings">
              <Settings size={16} color={COLORS.offwhite} style={{ opacity: 0.7 }} />
            </button>
          </div>
          <p style={{ color: COLORS.offwhite, opacity: 0.55, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, margin: "0 0 4px" }}>EARNED SO FAR</p>
          <p style={{ color: COLORS.offwhite, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, margin: 0, letterSpacing: -1, lineHeight: 1 }}>{formatMoney(totalEarned)}</p>

          {taxEstimate && (
            <button onClick={() => setShowTax((v) => !v)} style={{ marginTop: 10, border: "none", background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "6px 12px", color: COLORS.offwhite, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, cursor: "pointer", opacity: 0.8 }}>
              {showTax ? "HIDE TAX ESTIMATE" : "SHOW TAX ESTIMATE"}
            </button>
          )}

          {taxEstimate && showTax && (
            <div style={{ marginTop: 12, background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "14px 16px" }}>
              <p style={{ color: COLORS.amber, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, margin: "0 0 10px" }}>ESTIMATED DEDUCTIONS</p>
              <TaxRow label="Income Tax" value={taxEstimate.estimatedIncomeTax} />
              <TaxRow label="National Insurance" value={taxEstimate.estimatedNI} />
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", margin: "10px 0" }} />
              <TaxRow label="Est. take-home" value={taxEstimate.estimatedTakeHome} highlight />
              <p style={{ color: COLORS.offwhite, opacity: 0.4, fontFamily: FONT_BODY, fontSize: 11, margin: "10px 0 0", lineHeight: 1.4 }}>
                Rough estimate, {taxEstimate.region === "scotland" ? "Scottish" : "England/Wales/NI"} 2025/26 rates. Not financial advice.
              </p>
            </div>
          )}

          {profile?.tax_region === "skip" && (
            <button onClick={() => setShowSettings(true)} style={{ marginTop: 10, border: "1px dashed rgba(255,255,255,0.25)", background: "transparent", borderRadius: 4, padding: "6px 12px", color: COLORS.offwhite, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, cursor: "pointer", opacity: 0.7 }}>
              SET TAX REGION FOR ESTIMATES
            </button>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ maxWidth: 560, margin: "-1.25rem auto 0", padding: "0 1.25rem" }}>
        <div style={{ background: "white", borderRadius: 6, boxShadow: "0 4px 18px rgba(21,32,59,0.18)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <StatCell label="UPCOMING" value={formatMoney(totalUpcoming)} color={COLORS.ink} />
          <StatCell label="UNPAID" value={formatMoney(totalUnpaid)} color={totalUnpaid > 0 ? COLORS.clay : COLORS.ink} border />
          <StatCell label="NEXT PAYDAY" value={nextPayday ? formatDate(nextPayday, { month: "short", day: "numeric" }) : "-"} color={COLORS.ink} border />
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.75rem 1.25rem 4rem" }}>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px 10px 14px", background: COLORS.amber, color: COLORS.navy, border: "none", borderRadius: "3px 3px 0 0", fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600, letterSpacing: 1, cursor: "pointer" }}>
          <Plus size={15} /> ADD SHIFT
        </button>

        {showForm && (
          <div style={{ background: "white", borderRadius: "0 6px 6px 6px", boxShadow: "0 6px 20px rgba(21,32,59,0.15)", padding: "1.25rem 1.25rem 1.5rem", marginBottom: 28, overflow: "hidden", maxHeight: formVisible ? 800 : 0, opacity: formVisible ? 1 : 0, transform: formVisible ? "translateY(0)" : "translateY(-8px)", transition: "max-height 220ms ease, opacity 180ms ease, transform 180ms ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: COLORS.inkSoft, margin: 0 }}>{editingId ? "EDIT SHIFT" : "NEW SHIFT"}</p>
              <button onClick={closeForm} style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex" }}><X size={16} color={COLORS.inkSoft} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 14 }}>
              <div><label style={fieldLabelStyle}>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} /></div>
              <div><label style={fieldLabelStyle}>Start</label><input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} style={inputStyle} /></div>
              <div><label style={fieldLabelStyle}>End</label><input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} style={inputStyle} /></div>
              <div><label style={fieldLabelStyle}>Rate / hr (GBP )</label><input type="number" step="0.01" placeholder="12.50" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} style={inputStyle} /></div>
              <div><label style={fieldLabelStyle}>Payday</label><input type="date" value={form.payday} onChange={(e) => setForm({ ...form, payday: e.target.value })} style={inputStyle} /></div>
              <div><label style={fieldLabelStyle}>Notes</label><input type="text" placeholder="e.g. Night shift, overtime" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} /></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: COLORS.inkSoft }}>
                <input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} /> Already paid
              </label>
              <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.inkSoft }}>
                {calcHours(form.start, form.end)}h - est. {formatMoney(calcHours(form.start, form.end) * (parseFloat(form.rate) || 0))}
              </span>
            </div>
            {saveError && <p style={{ color: COLORS.clay, fontSize: 13, marginBottom: 12 }}>{saveError}</p>}
            <button onClick={handleSave} disabled={saving || offline} style={{ ...primaryButtonStyle, opacity: offline ? 0.5 : 1 }}>
              {offline ? "No connection" : saving ? "Saving..." : editingId ? "Save changes" : "Add to ledger"}
            </button>
            {offline && <p style={{ fontSize: 12, color: COLORS.clay, margin: "6px 0 0", textAlign: "center" }}>You're offline. Reconnect to save shifts.</p>}
          </div>
        )}

        <Ledger title="Upcoming" icon={<Calendar size={14} color={COLORS.inkSoft} />} shifts={future} emptyText="No upcoming shifts. Tap Add Shift to schedule one." onEdit={handleEdit} onDelete={handleDelete} onTogglePaid={togglePaid} />
        <Ledger title="Past" icon={<Clock size={14} color={COLORS.inkSoft} />} shifts={[...past].reverse()} emptyText="No past shifts logged yet. Add a shift to get started." onEdit={handleEdit} onDelete={handleDelete} onTogglePaid={togglePaid} />
      </div>
    </div>
  );
}

function TaxRow({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ color: COLORS.offwhite, opacity: highlight ? 1 : 0.65, fontFamily: FONT_MONO, fontSize: 12 }}>{label}</span>
      <span style={{ color: highlight ? COLORS.amber : COLORS.offwhite, opacity: highlight ? 1 : 0.8, fontFamily: FONT_MONO, fontSize: 12, fontWeight: highlight ? 600 : 400 }}>{formatMoney(value)}</span>
    </div>
  );
}

function StatCell({ label, value, color, border }) {
  return (
    <div style={{ padding: "14px 12px", borderLeft: border ? `1px solid ${COLORS.paperDim}` : "none", textAlign: "center" }}>
      <p style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1, color: COLORS.inkSoft, margin: "0 0 5px" }}>{label}</p>
      <p style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 600, color, margin: 0 }}>{value}</p>
    </div>
  );
}

function Ledger({ title, icon, shifts, emptyText, onEdit, onDelete, onTogglePaid }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${COLORS.paperDim}` }}>
        {icon}
        <h3 style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1.5, color: COLORS.inkSoft, fontWeight: 600 }}>{title.toUpperCase()}</h3>
      </div>
      {shifts.length === 0
        ? <p style={{ fontSize: 14, color: COLORS.inkSoft, fontStyle: "italic" }}>{emptyText}</p>
        : <div>{shifts.map((s) => <LedgerRow key={s.id} s={s} onEdit={onEdit} onDelete={onDelete} onTogglePaid={onTogglePaid} />)}</div>
      }
    </div>
  );
}

function LedgerRow({ s, onEdit, onDelete, onTogglePaid }) {
  const [tearing, setTearing] = useState(false);
  const handleToggle = (e) => { e.stopPropagation(); setTearing(true); setTimeout(() => setTearing(false), 320); onTogglePaid(s); };
  const statusColor = s.paid ? COLORS.sage : COLORS.amber;
  return (
    <div style={{ display: "flex", alignItems: "stretch", background: "white", borderRadius: 4, marginBottom: 7, boxShadow: "0 1px 3px rgba(21,32,59,0.08)", overflow: "hidden" }}>
      <div style={{ width: 4, background: statusColor, flexShrink: 0 }} />
      <button onClick={handleToggle} aria-label={s.paid ? "Mark as unpaid" : "Mark as paid"} style={{ border: "none", borderRight: `1px dashed ${COLORS.paperDim}`, background: "none", padding: "0 14px", display: "flex", alignItems: "center", cursor: "pointer", transform: tearing ? "scale(0.85) rotate(-4deg)" : "scale(1)", transition: "transform 220ms cubic-bezier(.34,1.56,.64,1)" }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 0.5, color: s.paid ? COLORS.sage : COLORS.inkSoft, fontWeight: 700 }}>{s.paid ? "PAID" : "MARK"}</span>
      </button>
      <div style={{ flex: 1, minWidth: 0, padding: "11px 14px", cursor: "pointer" }} onClick={() => onEdit(s)} role="button" tabIndex={0}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{formatDate(s.date)}</p>
          <p style={{ margin: 0, fontFamily: FONT_MONO, fontWeight: 600, fontSize: 15, color: COLORS.ink, whiteSpace: "nowrap" }}>{formatMoney(s.earnings)}</p>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkSoft, fontFamily: FONT_MONO }}>
          {s.start}-{s.end} - {s.hours}h - {formatMoney(s.rate)}/h
          {s.payday ? ` - pays ${formatDate(s.payday, { month: "short", day: "numeric" })}` : ""}
        </p>
        {s.notes && <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.inkSoft, fontStyle: "italic" }}>{s.notes}</p>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} aria-label="Delete shift" style={{ border: "none", background: "none", padding: "0 12px", display: "flex", alignItems: "center", color: COLORS.inkSoft, cursor: "pointer" }}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function SettingsPanel({ profile, onSave, onClose, onShowPrivacy, onLogout }) {
  const [taxRegion, setTaxRegion] = useState(profile?.tax_region || "rest_of_uk");
  const [otherIncome, setOtherIncome] = useState(String(profile?.other_income || "0"));
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [profession, setProfession] = useState(profile?.profession || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ first_name: firstName.trim(), last_name: lastName.trim(), profession: profession.trim(), tax_region: taxRegion, other_income: parseFloat(otherIncome) || 0 });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(21,32,59,0.85)", zIndex: 50, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: "2rem 1rem", fontFamily: FONT_BODY }}>
      <div style={{ background: COLORS.paper, borderRadius: 8, maxWidth: 420, width: "100%", padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, color: COLORS.inkSoft, margin: 0 }}>SETTINGS</p>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex" }}><X size={16} color={COLORS.inkSoft} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div><label style={fieldLabelStyle}>First name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} /></div>
          <div><label style={fieldLabelStyle}>Last name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label style={fieldLabelStyle}>Profession</label><input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} style={inputStyle} /></div>
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
        <NotificationToggle userId={profile?.id} />
        <button onClick={handleSave} disabled={saving} style={primaryButtonStyle}>{saved ? "Saved" : saving ? "Saving..." : "Save changes"}</button>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${COLORS.paperDim}`, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={onShowPrivacy} style={{ border: "none", background: "none", color: COLORS.inkSoft, cursor: "pointer", fontSize: 13, padding: 0, textDecoration: "underline", fontFamily: FONT_BODY }}>Privacy Policy</button>
          <button onClick={onLogout} style={{ border: "none", background: "none", color: COLORS.clay, cursor: "pointer", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT_BODY }}><LogOut size={13} /> Log out</button>
        </div>
      </div>
    </div>
  );
}
