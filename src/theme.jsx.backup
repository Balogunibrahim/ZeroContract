// ============================================================
//  Zero Contract — shared design system
//  Change a colour or font here and it updates the whole app.
// ============================================================

export const COLORS = {
  bg: "#efeeec",       // light warm-grey app background
  ink: "#141414",      // near-black main text
  inkSoft: "#6f6c66",  // grey secondary text
  label: "#9b9689",    // muted taupe for small UPPERCASE labels
  card: "#ffffff",     // white cards
  border: "#e4e2dd",   // thin card borders
  line: "#dcdad5",     // dividers
  black: "#0e0e0e",    // solid black cards / chips / buttons
  navy: "#26324f",     // calendar accents
  danger: "#b4472f",   // unpaid / log out
};

export const FONTS = {
  // Heavy grotesque for the big page titles
  display: "'Archivo Black', 'Arial Black', system-ui, sans-serif",
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

// Standard white card
export const cardStyle = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 2,
};

// ---- Formatting helpers ----------------------------------

export function formatMoney(n) {
  return (Number(n) || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "GBP",
  });
}

// £15/h style — trims trailing zeros (15, 13.75, 12.5)
export function formatRate(rate) {
  return "£" + (Number(rate) || 0);
}

export function formatDate(iso, opts) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(
    undefined,
    opts || { weekday: "short", month: "short", day: "numeric" }
  );
}

// ---- Reusable components ---------------------------------

// The small grey label that sits above every page title
export function ScreenLabel({ children }) {
  return (
    <p style={{ ...labelStyle, marginBottom: 4 }}>{children}</p>
  );
}

// The big page title with the layered 3D "extruded" shadow
export function DisplayHeader({ children }) {
  // Build a staircase of grey copies going up-and-left behind the text
  const STEPS = 16;
  const layers = [];
  for (let i = 1; i <= STEPS; i++) {
    const v = Math.round(200 + (i / STEPS) * 38); // 202 (near) -> 238 (far)
    layers.push(`-${i}px -${i}px 0 rgb(${v},${v},${v})`);
  }
  return (
    <h1
      style={{
        fontFamily: FONTS.display,
        fontWeight: 400,
        fontSize: "clamp(46px, 15.5vw, 66px)",
        lineHeight: 1,
        letterSpacing: "-0.01em",
        textTransform: "uppercase",
        color: COLORS.ink,
        margin: "6px 0 22px",
        textShadow: layers.join(", "),
      }}
    >
      {children}
    </h1>
  );
}
