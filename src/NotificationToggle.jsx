import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  isPushSupported,
  isIOS,
  isStandalone,
  getCurrentSubscriptionStatus,
  enablePushNotifications,
  disablePushNotifications,
} from "./pushNotifications";

const COLORS = {
  paperDim: "#EDE7DA",
  ink: "#1C1A17",
  inkSoft: "#6B6558",
  amber: "#E8A33D",
  clay: "#C2543F",
  sage: "#7C9070",
};

const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";
const FONT_BODY = "'Inter', -apple-system, sans-serif";

export default function NotificationToggle({ userId }) {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCurrentSubscriptionStatus().then(setStatus);
  }, []);

  const handleToggle = async () => {
    setError("");
    setBusy(true);
    try {
      if (status === "subscribed") {
        await disablePushNotifications(userId);
        setStatus("not-subscribed");
      } else {
        await enablePushNotifications(userId);
        setStatus("subscribed");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setBusy(false);
  };

  if (status === "unsupported") {
    return (
      <div style={{ padding: "12px 14px", background: COLORS.paperDim, borderRadius: 6, fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.5 }}>
        Reminders aren't supported in this browser.
      </div>
    );
  }

  const iosNotInstalled = isIOS() && !isStandalone();

  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: FONT_MONO, marginBottom: 8 }}>
        Reminders
      </p>

      {iosNotInstalled && (
        <div style={{ padding: "10px 12px", background: COLORS.paperDim, borderRadius: 6, fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 10 }}>
          On iPhone, add Zero Contract to your home screen first (Share button then "Add to Home Screen"), then come back here to turn on reminders.
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={busy || status === "checking" || status === "denied" || iosNotInstalled}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderRadius: 6,
          border: `1px solid ${COLORS.paperDim}`,
          background: "white",
          cursor: iosNotInstalled ? "not-allowed" : "pointer",
          opacity: iosNotInstalled ? 0.5 : 1,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: COLORS.ink, fontFamily: FONT_BODY }}>
          {status === "subscribed" ? <Bell size={16} color={COLORS.sage} /> : <BellOff size={16} color={COLORS.inkSoft} />}
          {status === "checking" ? "Checking..." : status === "subscribed" ? "Reminders are on" : "Turn on reminders"}
        </span>
        <span style={{ fontSize: 12, color: COLORS.inkSoft, fontFamily: FONT_MONO }}>
          {busy ? "..." : status === "subscribed" ? "TAP TO TURN OFF" : "TAP TO ENABLE"}
        </span>
      </button>

      {status === "denied" && (
        <p style={{ fontSize: 12, color: COLORS.clay, marginTop: 8, lineHeight: 1.5 }}>
          Notifications are blocked for this site. You'll need to allow them in your phone or browser settings.
        </p>
      )}

      {error && <p style={{ fontSize: 12, color: COLORS.clay, marginTop: 8, lineHeight: 1.5 }}>{error}</p>}

      <p style={{ fontSize: 11.5, color: COLORS.inkSoft, opacity: 0.7, marginTop: 8, lineHeight: 1.5 }}>
        You'll get a reminder the day before payday, the evening before a shift, and an hour before it starts.
      </p>
    </div>
  );
}
