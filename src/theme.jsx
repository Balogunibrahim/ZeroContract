// ============================================================
//  Zero Contract — shared design system
//  Change a colour or font here and it updates the whole app.
// ============================================================

// Colours resolve to CSS variables (defined in index.css) so the whole app can
// switch between light and dark. Neutrals (bg/card/ink/…) flip; the green and
// gold brand accents stay the same in both modes.
export const COLORS = {
  bg: "var(--zc-bg)",
  ink: "var(--zc-ink)",
  inkSoft: "var(--zc-inkSoft)",
  label: "var(--zc-label)",
  card: "var(--zc-card)",
  border: "var(--zc-border)",
  line: "var(--zc-line)",
  black: "var(--zc-black)",
  navy: "var(--zc-navy)",
  danger: "var(--zc-danger)",
  brand: "var(--zc-brand)",
  deep: "var(--zc-deep)",
  gold: "var(--zc-gold)",
  tint: "var(--zc-tint)",
  goldTint: "var(--zc-goldTint)",
};

// ---- Theme + currency runtime state -----------------------
export function applyTheme(pref) {
  const dark = pref === "dark" || (pref === "system" && typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (typeof document !== "undefined") document.documentElement.dataset.theme = dark ? "dark" : "light";
}

const CURRENCY_SYMBOLS = { GBP: "£", EUR: "€", USD: "$" };
let ACTIVE_CURRENCY = "GBP";
export function setCurrency(code) {
  if (CURRENCY_SYMBOLS[code]) ACTIVE_CURRENCY = code;
}
export function currencySymbol() {
  return CURRENCY_SYMBOLS[ACTIVE_CURRENCY] || "£";
}

export const FONTS = {
  // Characterful grotesk for titles and all the big numbers
  display: "'Space Grotesk', system-ui, sans-serif",
  // Clean sans for everything else
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// A small uppercase, letter-spaced label (e.g. "EARNED SO FAR")
export const labelStyle = {
  fontFamily: FONTS.body,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: COLORS.label,
  margin: 0,
};

// Standard white card — now soft and rounded
export const cardStyle = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 18,
  boxShadow: "0 1px 2px rgba(11,61,46,.05)",
};

// ---- Formatting helpers ----------------------------------

export function formatMoney(n) {
  return (Number(n) || 0).toLocaleString(undefined, {
    style: "currency",
    currency: ACTIVE_CURRENCY,
  });
}

// £15/h style — trims trailing zeros (15, 13.75, 12.5)
export function formatRate(rate) {
  return currencySymbol() + (Number(rate) || 0);
}

export function formatDate(iso, opts) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(
    undefined,
    opts || { weekday: "short", month: "short", day: "numeric" }
  );
}

// Whole days from today until an ISO date (negative if past)
export function daysUntil(iso) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

// ---- Reusable components ---------------------------------

// The small grey/green label that sits above every page title
export function ScreenLabel({ children }) {
  return (
    <p style={{ ...labelStyle, color: COLORS.brand, marginBottom: 4 }}>
      {children}
    </p>
  );
}

// The big page title — clean, bold, no more 3D extrude
export function DisplayHeader({ children }) {
  return (
    <h1
      style={{
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: "clamp(28px, 7.5vw, 38px)",
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        color: COLORS.ink,
        margin: "6px 0 20px",
      }}
    >
      {children}
    </h1>
  );
}

// A conic-gradient progress ring with a white centre for content
export function Ring({
  percent = 0,
  size = 58,
  thickness = 7,
  color = COLORS.brand,
  track = COLORS.tint,
  children,
}) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: "50%",
        background: `conic-gradient(${color} 0 ${p}%, ${track} ${p}% 100%)`,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: size - thickness * 2,
          height: size - thickness * 2,
          borderRadius: "50%",
          background: COLORS.card,
          display: "grid",
          placeItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// The Zero Contract logo mark — the real-rate gauge.
// `dark` renders the on-forest variant: mint→gold gradient, gold arrow.
export function LogoMark({ size = 30, dark = false }) {
  const gradId = dark ? "zc-logo-grad-dark" : "zc-logo-grad";
  const track = dark ? "rgba(255,255,255,.15)" : "#DDE7E1";
  const arrow = dark ? "#F0C766" : COLORS.deep;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient
          id={gradId}
          x1="20"
          y1="80"
          x2="80"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={dark ? "#5FE3A9" : COLORS.brand} />
          <stop offset="1" stopColor={dark ? "#F0C766" : COLORS.gold} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="34" stroke={track} strokeWidth="12" />
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke={`url(#${gradId})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="167 214"
        transform="rotate(-90 50 50)"
      />
      <path d="M50 40l9 11H41z" fill={arrow} />
      <rect x="46.5" y="49" width="7" height="15" rx="3" fill={arrow} />
    </svg>
  );
}

// The full logo lockup: mark + wordmark.
// `dark` = light text with gold "Contract", for forest-green surfaces.
export function LogoLockup({ size = 28, dark = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <LogoMark size={size} dark={dark} />
      <span
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: size * 0.56,
          letterSpacing: "-0.01em",
          color: dark ? COLORS.bg : COLORS.ink,
        }}
      >
        Zero
        <span style={{ color: dark ? COLORS.gold : COLORS.brand }}>
          Contract
        </span>
      </span>
    </div>
  );
}
