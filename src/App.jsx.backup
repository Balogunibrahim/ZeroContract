import { useState, useEffect, useMemo } from "react";
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
import { estimateTax } from "./utils/taxUtils";

const COLORS = { navy: "#efeeec", paper: "#efeeec", offwhite: "#6f6c66" };
const FONT_MONO = "'Inter', sans-serif";
const FONT_DISPLAY = "'Archivo Black', 'Arial Black', sans-serif";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function ensureFonts() {
  if (document.getElementById("zc-fonts")) return;
  const link = document.createElement("link");
  link.id = "zc-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);
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
    <div style={{ minHeight: "100vh", background: COLORS.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: COLORS.offwhite, fontFamily: FONT_MONO, fontSize: 13, letterSpacing: 1, opacity: 0.7 }}>LOADING...</p>
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

  if (authLoading) return <Spinner />;

  if (isPasswordReset && session) {
    return (
      <>
        {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
        <ResetPassword onDone={() => window.history.replaceState(null, "", window.location.pathname)} />
      </>
    );
  }

  return (
    <>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {!session ? (
        <AuthScreen onShowPrivacy={() => setShowPrivacy(true)} />
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
          }))
        );
      }

      if (profileData) {
        setProfile(profileData);
      } else {
        const pending = sessionStorage.getItem("zc_pending_profile");
        if (pending) {
          const parsed = JSON.parse(pending);
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              ...parsed,
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
      };
      const { error } = editingShift
        ? await supabase.from("shifts").update(row).eq("id", editingShift.id)
        : await supabase.from("shifts").insert(row);
      if (error) throw error;
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
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: session.user.id, ...updates })
      .select()
      .single();
    if (data) setProfile(data);
    return error ? error.message : null;
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
  const shiftsWithTravel = enriched.filter((s) => s.travelCost > 0).sort((a, b) => (a.date < b.date ? 1 : -1));

  if (!loaded) return <Spinner />;

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: "#1C1A17", marginBottom: 8 }}>Couldn't load your data</p>
          <p style={{ color: "#6B6558", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Check your internet connection and try again.</p>
          <button
            onClick={loadAll}
            style={{ padding: "10px 24px", borderRadius: 4, border: "none", background: "#1C1A17", color: "#EDEAE2", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, textAlign: "left", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {offline && (
        <div style={{ background: "#C2543F", color: "white", padding: "8px 16px", textAlign: "center", fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}>
          No internet connection. Changes will sync when you're back online.
        </div>
      )}

      {activeTab === "home" && (
        <HomeTab
          firstName={profile?.first_name || ""}
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
        <PlannerTab future={future} past={past} onEdit={openEditShift} onDelete={handleDelete} onTogglePaid={togglePaid} />
      )}
      {activeTab === "money" && <MoneyTab profile={profile} taxEstimate={taxEstimate} baselineEarnings={allEarnings} />}
      {activeTab === "travel" && <TravelTab shiftsWithTravel={shiftsWithTravel} totalTravelCost={totalTravelCost} />}
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
          onSave={handleSave}
          onClose={closeForm}
          saving={saving}
          saveError={saveError}
        />
      )}
    </div>
  );
}
