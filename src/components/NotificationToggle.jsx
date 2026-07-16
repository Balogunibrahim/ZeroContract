import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  isIOS,
  isStandalone,
  getCurrentSubscriptionStatus,
  enablePushNotifications,
  disablePushNotifications,
} from "../utils/pushNotifications";
import { COLORS, FONTS } from "../theme";

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
      <div style={{ ...cardStyle, fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5 }}>
        Reminders aren't supported in this browser.
      </div>
    );
  }

  const iosNotInstalled = isIOS() && !isStandalone();
  const on = status === "subscribed";
  const disabled = busy || status === "checking" || status === "denied" || iosNotInstalled;

  return (
    <div>
      {iosNotInstalled && (
        <div style={{ ...cardStyle, fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 10 }}>
          On iPhone, add Zero Contract to your home screen first (Share button then "Add to Home Screen"), then come back here to turn on reminders.
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={disabled}
        style={{
          ...cardStyle,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: iosNotInstalled ? 0.5 : 1,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONTS.body, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>
          {on ? <Bell size={17} color={COLORS.ink} /> : <BellOff size={17} color={COLORS.inkSoft} />}
          {status === "checking" ? "Checking..." : on ? "Reminders are on" : "Reminders are off"}
        </span>
        <Switch on={on} />
      </button>

      {status === "denied" && (
        <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.danger, marginTop: 8, lineHeight: 1.5 }}>
          Notifications are blocked for this site. You'll need to allow them in your phone or browser settings.
        </p>
      )}
      {error && <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.danger, marginTop: 8, lineHeight: 1.5 }}>{error}</p>}

      <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.inkSoft, marginTop: 12, lineHeight: 1.5 }}>
        We'll nudge you the day before payday, before a shift, and if a shift ends up unpaid.
      </p>
    </div>
  );
}

const cardStyle = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 2,
  padding: "16px 18px",
};

function Switch({ on }) {
  return (
    <span
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        background: on ? COLORS.black : "#cfccc4",
        display: "inline-flex",
        alignItems: "center",
        padding: 3,
        boxSizing: "border-box",
        transition: "background 150ms",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transform: on ? "translateX(20px)" : "translateX(0)",
          transition: "transform 150ms",
        }}
      />
    </span>
  );
}
