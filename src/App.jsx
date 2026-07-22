import { useState, useEffect, useMemo, useRef } from "react";
import { Bell } from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import AuthScreen from "./components/AuthScreen";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ResetPassword from "./components/ResetPassword";
import BottomNav from "./components/BottomNav";
import AddShiftForm from "./components/AddShiftForm";
import HomeTab from "./tabs/HomeTab";
import PlannerTab from "./tabs/PlannerTab";
import MoneyTab from "./tabs/MoneyTab";
import TravelTab from "./tabs/TravelTab";
import ProfileTab from "./tabs/ProfileTab";
import OnboardingWelcome from "./components/OnboardingWelcome";
import IntroSplash from "./components/IntroSplash";
import Landing from "./components/Landing";
import { estimateTax } from "./utils/taxUtils";
import { COLORS as UI, FONTS as UIFONT, LogoLockup, applyTheme, setCurrency } from "./theme";

const COLORS = { navy: "#F4F6F3", paper: "#F4F6F3", offwhite: "#5E6B63" };
const FONT_MONO = "'Inter', sans-serif";
const FONT_DISPLAY = "'Space Grotesk', 'Arial Black', sans-serif";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

function Spinner() {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }} role="status" aria-label="Loading">
      <div className="zc-spinner" />
      <p style={{ color: COLORS.offwhite, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.7, margin: 0 }}>Loading your ledger</p>
    </div>
  );
}

// Sticky top bar with the logo, carried across every screen
function TopBar({ firstName, onProfile }) {
  const initial = (firstName || "?").charAt(0).toUpperCase();
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: UI.bg,
        borderBottom: `1px solid ${UI.border}`,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <LogoLockup size={26} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              position: "relative",
              width: 38,
              height: 38,
              borderRadius: 12,
              background: UI.card,
              border: `1px solid ${UI.border}`,
              display: "grid",
              placeItems: "center",
              color: UI.inkSoft,
            }}
          >
            <Bell size={18} strokeWidth={1.9} />
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 9,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: UI.gold,
                border: `1.5px solid ${UI.bg}`,
              }}
            />
          </div>
          <button
            onClick={onProfile}
            aria-label="Profile"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg,#0A7B57,#0B3D2E)",
              color: "#fff",
              fontFamily: UIFONT.display,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {initial}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const isPasswordReset = useState(() => window.location.hash.includes("type=recovery"))[0];
  const [introDone, setIntroDone] = useState(() => {
    try { return sessionStorage.getItem("zc_intro") === "1"; } catch { return true; }
  });
  const intro = !introDone ? (
    <IntroSplash onDone={() => { try { sessionStorage.setItem("zc_intro", "1"); } catch { /* ignore */ } setIntroDone(true); }} />
  ) : null;
  const [authEntry, setAuthEntry] = useState(null); // null = landing, "login" | "signup" = show auth

  useEffect(() => {
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
      if (["SIGNED_OUT", "TOKEN_REFRESHED", "SIGNED_IN", "USER_UPDATED"].includes(event)) {
        setAuthLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (authLoading) return <>{intro}<Spinner /></>;

  if (isPasswordReset && session) {
    return (
      <>
        {intro}
        {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
        <ResetPassword onDone={() => window.history.replaceState(null, "", window.location.pathname)} />
      </>
    );
  }

  return (
    <>
      {intro}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {!session ? (
        authEntry ? (
          <AuthScreen onShowPrivacy={() => setShowPrivacy(true)} initialMode={authEntry} />
        ) : (
          <Landing onLogin={() => setAuthEntry("login")} onSignup={() => setAuthEntry("signup")} />
        )
      ) : (
        <MainApp session={session} onShowPrivacy={() => setShowPrivacy(true)} offline={offline} />
      )}
    </>
  );
}

function MainApp({ session, onShowPrivacy, offline }) {
  const [activeTab, setActiveTab] = useState("home");
  const [shifts, setShifts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [idleWarning, setIdleWarning] = useState(false);
  const resetIdle = useRef(() => {});

  // Sign out for security when the app stays in the background a while. A short
  // grace period means quick app-switches (adding to calendar, exporting a
  // timesheet, glancing at another app) don't log you out.
  useEffect(() => {
    const GRACE_MS = 45 * 1000;
    let timer;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        timer = setTimeout(() => supabase.auth.signOut(), GRACE_MS);
      } else {
        clearTimeout(timer);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // Apply theme + currency preferences (from profile.settings).
  const themePref = profile?.settings?.theme || "system";
  const currencyPref = profile?.settings?.currency || "GBP";
  setCurrency(currencyPref);
  useEffect(() => {
    applyTheme(themePref);
    if (themePref === "system" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyTheme("system");
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    }
  }, [themePref]);

  // Auto sign-out after 30 minutes of inactivity, with a 1-minute warning.
  useEffect(() => {
    const IDLE_MS = 30 * 60 * 1000;
    const WARN_MS = 60 * 1000;
    let warnTimer, outTimer;
    const arm = () => {
      clearTimeout(warnTimer);
      clearTimeout(outTimer);
      setIdleWarning(false);
      warnTimer = setTimeout(() => setIdleWarning(true), IDLE_MS - WARN_MS);
      outTimer = setTimeout(() => supabase.auth.signOut(), IDLE_MS);
    };
    resetIdle.current = arm;
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    let last = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - last > 2000) { last = now; arm(); }
    };
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    arm();
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearTimeout(warnTimer);
      clearTimeout(outTimer);
    };
  }, []);

  const loadAll = async () => {
    setLoadError(false);
    try {
      const [{ data: shiftsData, error: shiftsError }, { data: profileData }] = await Promise.all([
        supabase.from("shifts").select("*").order("date", { ascending: true }),
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      ]);
      if (shiftsError) throw shiftsError;

      if (shiftsData) {
        setShifts(
          shiftsData.map((s) => ({
            id: s.id,
            date: s.date,
            start: s.start_time?.slice(0, 5),
            end: s.end_time?.slice(0, 5),
            hours: Number(s.hours),
            rate: Number(s.rate),
            payday: s.payday,
            paid: s.paid,
            notes: s.notes || "",
            travelCost: Number(s.travel_cost || 0),
            workAddress: s.work_address || "",
            distanceKm: s.distance_km ? Number(s.distance_km) : null,
            employer: s.employer || "",
            travelMode: s.travel_mode || null,
          }))
        );
      }

      if (profileData) {
        setProfile(profileData);
      } else {
        // Build the profile either from the pending signup form (email signup)
        // or from provider metadata (Google / Apple / Facebook sign-in).
        const pending = sessionStorage.getItem("zc_pending_profile");
        let fields;
        if (pending) {
          fields = JSON.parse(pending);
        } else {
          const meta = session.user.user_metadata || {};
          const fullName = (meta.full_name || meta.name || "").trim();
          const parts = fullName ? fullName.split(/\s+/) : [];
          const first = parts.shift() || (session.user.email ? session.user.email.split("@")[0] : "there");
          fields = {
            first_name: first,
            last_name: parts.join(" "),
            profession: "",
            tax_region: "rest_of_uk",
          };
        }
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: session.user.id,
            ...fields,
            privacy_consent: true,
            privacy_consent_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (newProfile) {
          setProfile(newProfile);
          sessionStorage.removeItem("zc_pending_profile");
        }
      }
      if (shiftsData && shiftsData.length === 0) {
        setShowOnboarding(true);
      }
    } catch (err) {
      setLoadError(true);
    }
    setLoaded(true);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFormState = () => {
    setEditingShift(null);
    setSaveError("");
  };

  const openAddShift = () => {
    resetFormState();
    setShowForm(true);
  };
  const openEditShift = (s) => {
    setEditingShift(s);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    resetFormState();
  };

  const handleSave = async (form) => {
    if (!form.date || !form.rate) {
      setSaveError("Date and hourly rate are required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const hours = calcHours(form.start, form.end);
      const row = {
        user_id: session.user.id,
        date: form.date,
        start_time: form.start,
        end_time: form.end,
        hours,
        rate: parseFloat(form.rate) || 0,
        payday: form.payday || null,
        paid: !!form.paid,
        notes: form.notes,
        travel_cost: parseFloat(form.travelCost) || 0,
        work_address: form.workAddress ? form.workAddress.trim() : null,
        distance_km: form.distanceKm || null,
        employer: form.employer ? form.employer.trim() : null,
        travel_mode: form.travelMode || null,
      };
      const { error } = editingShift
        ? await supabase.from("shifts").update(row).eq("id", editingShift.id)
        : await supabase.from("shifts").insert(row);
      if (error) throw error;

      // Always remember the employer so it can be reused next time.
      const empName = row.employer;
      const empRate = row.rate;
      if (empName && empRate > 0 && !employers.some((e) => e.name.toLowerCase() === empName.toLowerCase())) {
        const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
        try { await addEmployer({ id, name: empName, rate: empRate }); } catch (e) { /* non-fatal */ }
      }

      await loadAll();
      closeForm();
    } catch (err) {
      setSaveError("Couldn't save your shift. Check your connection and try again.");
    }
    setSaving(false);
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
    // Update only the changed columns. An upsert would try to INSERT a row whose
    // NOT-NULL columns (first_name) aren't in `updates`, which Postgres rejects
    // even when the row already exists — so use a plain UPDATE here.
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .maybeSingle();

    if (data) {
      setProfile(data);
      return null;
    }
    if (error) return error.message;

    // No row existed yet — create one with the required fields, then the updates.
    const meta = session.user.user_metadata || {};
    const fullName = (meta.full_name || meta.name || "").trim();
    const first = (fullName.split(/\s+/)[0]) || (session.user.email ? session.user.email.split("@")[0] : "there");
    const { data: created, error: insErr } = await supabase
      .from("profiles")
      .insert({
        id: session.user.id,
        first_name: first,
        last_name: "",
        profession: "",
        privacy_consent: true,
        privacy_consent_at: new Date().toISOString(),
        ...updates,
      })
      .select()
      .single();
    if (created) setProfile(created);
    return insErr ? insErr.message : null;
  };

  const employers = profile?.settings?.employers || [];
  const addEmployer = async (emp) => {
    const next = [...employers, emp];
    await saveProfile({ settings: { ...(profile?.settings || {}), employers: next } });
    return next;
  };

  const today = todayISO();
  const enriched = useMemo(
    () =>
      shifts
        .map((s) => ({ ...s, earnings: Math.round(s.hours * s.rate * 100) / 100 }))
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [shifts]
  );
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
  const taxEstimate =
    profile && profile.tax_region !== "skip"
      ? estimateTax(allEarnings, profile.other_income || 0, profile.tax_region || "rest_of_uk")
      : null;
  const nextShift = future.length > 0 ? future[0] : null;
  const totalTravelCost = enriched.reduce((sum, s) => sum + (s.travelCost || 0), 0);
  const totalHours = enriched.reduce((sum, s) => sum + (s.hours || 0), 0);
  const shiftsWithTravel = enriched.filter((s) => s.travelCost > 0).sort((a, b) => (a.date < b.date ? 1 : -1));

  // Employers for the picker: saved list + any employer ever used on a shift
  // (most recent rate wins for shift-derived ones), deduped by name.
  const employerOptions = useMemo(() => {
    const byName = new Map();
    employers.forEach((e) => byName.set(e.name.toLowerCase(), { ...e }));
    [...enriched]
      .filter((s) => s.employer)
      .sort((a, b) => (a.date < b.date ? 1 : -1)) // most recent first
      .forEach((s) => {
        const key = s.employer.toLowerCase();
        if (!byName.has(key)) byName.set(key, { name: s.employer, rate: s.rate });
      });
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [employers, enriched]);

  if (!loaded) return <Spinner />;

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", background: UI.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <p style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: UI.ink, marginBottom: 8 }}>Couldn't load your data</p>
          <p style={{ color: UI.inkSoft, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Check your internet connection and try again.</p>
          <button
            onClick={loadAll}
            style={{ padding: "11px 26px", borderRadius: 12, border: "none", background: UI.deep, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: FONT_MONO }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, textAlign: "left", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <TopBar firstName={profile?.first_name || ""} onProfile={() => setActiveTab("profile")} />

      {offline && (
        <div style={{ background: "#C2543F", color: "white", padding: "8px 16px", textAlign: "center", fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}>
          No internet connection. Changes will sync when you're back online.
        </div>
      )}

      {activeTab === "home" && (
        <HomeTab
          firstName={profile?.first_name || ""}
          homeAddress={profile?.home_address || ""}
          totalEarned={totalEarned}
          upcomingCount={future.length}
          totalUnpaid={totalUnpaid}
          nextPayday={nextPayday}
          taxEstimate={taxEstimate}
          nextShift={nextShift}
          onSeeBreakdown={() => setActiveTab("money")}
        />
      )}
      {activeTab === "planner" && (
        <PlannerTab future={future} past={past} onEdit={openEditShift} onDelete={handleDelete} onTogglePaid={togglePaid} employers={employerOptions} profile={profile} />
      )}
      {activeTab === "money" && <MoneyTab profile={profile} taxEstimate={taxEstimate} baselineEarnings={allEarnings} />}
      {activeTab === "travel" && <TravelTab shiftsWithTravel={shiftsWithTravel} totalTravelCost={totalTravelCost} totalEarnings={allEarnings} totalHours={totalHours} />}
      {activeTab === "profile" && (
        <ProfileTab
          profile={profile}
          session={session}
          onSave={saveProfile}
          onShowPrivacy={onShowPrivacy}
          onLogout={() => supabase.auth.signOut()}
        />
      )}

      {showOnboarding && (
        <OnboardingWelcome
          firstName={profile?.first_name || ""}
          onAddShift={() => {
            setShowOnboarding(false);
            openAddShift();
          }}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}

      <BottomNav active={activeTab} onChange={setActiveTab} onAddShift={openAddShift} />

      {showForm && (
        <AddShiftForm
          editingShift={editingShift}
          homeAddress={profile?.home_address || ""}
          lastWorkAddress={[...enriched].reverse().find((s) => s.workAddress)?.workAddress || ""}
          employers={employerOptions}
          onAddEmployer={addEmployer}
          onSave={handleSave}
          onClose={closeForm}
          saving={saving}
          saveError={saveError}
        />
      )}

      {idleWarning && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(11,33,25,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: UIFONT.body }}>
          <div style={{ background: UI.bg, borderRadius: 24, maxWidth: 360, width: "100%", padding: "1.75rem", boxShadow: "0 30px 60px -22px rgba(0,0,0,.5)", textAlign: "center" }}>
            <p style={{ fontFamily: UIFONT.display, fontSize: 20, fontWeight: 700, color: UI.ink, margin: "0 0 8px" }}>Still there?</p>
            <p style={{ fontSize: 14, color: UI.inkSoft, lineHeight: 1.55, margin: "0 0 20px" }}>
              You've been inactive for a while. For your security we'll sign you out in a minute.
            </p>
            <button
              onClick={() => resetIdle.current()}
              style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#0A7B57,#0B3D2E)", color: "#fff", fontFamily: UIFONT.body, fontWeight: 600, fontSize: 15, boxShadow: "0 12px 24px -10px rgba(10,123,87,.55)" }}
            >
              Stay signed in
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{ width: "100%", padding: 12, marginTop: 8, borderRadius: 14, border: "none", background: "none", color: UI.inkSoft, fontFamily: UIFONT.body, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              Sign out now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
