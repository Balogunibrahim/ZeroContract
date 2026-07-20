import { useState, useEffect } from "react";
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from "lucide-react";
import { COLORS, FONTS, cardStyle } from "../theme";
import { geocodeAddress } from "../utils/mapsUtils";

const CACHE_KEY = "zc_weather";
const CACHE_MINS = 60;

// WMO weather code -> label + icon + kind flags
function describe(code) {
  if (code === 0) return { label: "Clear skies", Icon: Sun };
  if (code === 1 || code === 2) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if (code === 45 || code === 48) return { label: "Foggy", Icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: "Drizzle", Icon: CloudDrizzle, rain: true };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: "Rain", Icon: CloudRain, rain: true };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { label: "Snow", Icon: CloudSnow, snow: true };
  if (code >= 95) return { label: "Thunderstorms", Icon: CloudLightning, rain: true, storm: true };
  return { label: "Mixed", Icon: Cloud };
}

// Short, catchy "what to wear" line from the day's high, rain chance, wind and conditions.
function outfitAdvice(maxT, precip, wind, d) {
  let s;
  if (maxT < 3) s = "🥶 It's Baltic! Thermals, big coat, gloves — dress like a snowman.";
  else if (maxT < 9) s = "🧣 Proper chilly. Wrap up — warm coat and a cheeky jumper.";
  else if (maxT < 14) s = "🧥 A bit fresh. Chuck on a hoodie or jacket and you're golden.";
  else if (maxT < 19) s = "😎 Sweet spot. Light jacket or long sleeves does the trick.";
  else if (maxT < 24) s = "👕 Lovely one! T-shirt weather — stash a layer for tonight.";
  else s = "🔥 Scorcher! Keep it light and breezy, and slap on the sunscreen.";

  // One extra weather zinger, highest drama wins.
  if (d.storm) s += " ⛈️ Storms brewing — keep your head down!";
  else if (d.snow) s += " ❄️ Snow's about — boots with grip, no ice-skating.";
  else if (d.rain || precip >= 50) s += " ☔ Rain incoming — grab the brolly, don't get caught out.";
  else if (precip >= 30) s += " 🌦️ Sneaky showers lurking — pack a rain layer just in case.";
  if (wind >= 35) s += " 💨 Blowing a gale — windproof up and hold onto your hat!";
  return s;
}

function getCoords(homeAddress) {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        async () => {
          // GPS denied/unavailable — try the saved home address
          if (homeAddress) {
            try { resolve(await geocodeAddress(homeAddress)); return; } catch (e) { /* fall through */ }
          }
          reject(new Error("no-location"));
        },
        { timeout: 8000, maximumAge: 30 * 60 * 1000 }
      );
    } else if (homeAddress) {
      geocodeAddress(homeAddress).then(resolve).catch(() => reject(new Error("no-location")));
    } else {
      reject(new Error("no-location"));
    }
  });
}

async function fetchWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=auto&forecast_days=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather-fetch-failed");
  const j = await res.json();
  return {
    now: Math.round(j.current.temperature_2m),
    code: j.current.weather_code,
    wind: Math.round(j.current.wind_speed_10m),
    max: Math.round(j.daily.temperature_2m_max[0]),
    min: Math.round(j.daily.temperature_2m_min[0]),
    precip: j.daily.precipitation_probability_max?.[0] ?? 0,
  };
}

export default function WeatherCard({ homeAddress }) {
  const [state, setState] = useState("loading"); // loading | ok | unavailable
  const [w, setW] = useState(null);

  useEffect(() => {
    let alive = true;

    // Use a cached reading if it's under an hour old.
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.ts < CACHE_MINS * 60 * 1000) {
        setW(cached.data);
        setState("ok");
        return;
      }
    } catch (e) { /* ignore */ }

    (async () => {
      try {
        const { lat, lng } = await getCoords(homeAddress);
        const data = await fetchWeather(lat, lng);
        if (!alive) return;
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
        setW(data);
        setState("ok");
      } catch (e) {
        if (alive) setState("unavailable");
      }
    })();

    return () => { alive = false; };
  }, [homeAddress]);

  if (state === "loading") {
    return (
      <div style={{ ...cardStyle, borderRadius: 20, padding: "15px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: COLORS.tint }} />
        <p style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, margin: 0 }}>Checking today's weather…</p>
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <div style={{ ...cardStyle, borderRadius: 20, padding: "15px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, flex: "0 0 46px", borderRadius: 14, background: COLORS.tint, color: COLORS.brand, display: "grid", placeItems: "center" }}>
          <CloudSun size={22} strokeWidth={1.9} />
        </div>
        <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.inkSoft, margin: 0, lineHeight: 1.5 }}>
          Turn on location (or add your home address in Settings) to see today's weather and an outfit tip.
        </p>
      </div>
    );
  }

  const d = describe(w.code);
  const Icon = d.Icon;
  const advice = outfitAdvice(w.max, w.precip, w.wind, d);

  return (
    <div style={{ ...cardStyle, borderRadius: 20, padding: "16px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 50, height: 50, flex: "0 0 50px", borderRadius: 15, background: COLORS.tint, color: COLORS.brand, display: "grid", placeItems: "center" }}>
          <Icon size={26} strokeWidth={1.9} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: COLORS.label, margin: 0 }}>
            Today · {d.label}
          </p>
          <p style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: COLORS.ink, margin: "2px 0 0", letterSpacing: "-0.02em" }}>
            {w.now}°<span style={{ fontSize: 13, fontWeight: 500, color: COLORS.inkSoft, marginLeft: 8 }}>H {w.max}° · L {w.min}°</span>
          </p>
        </div>
      </div>
      <div style={{ background: COLORS.tint, borderRadius: 13, padding: "11px 13px", margin: "13px 0 0" }}>
        <p style={{ fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600, color: COLORS.deep, margin: 0, lineHeight: 1.5 }}>
          {advice}
        </p>
      </div>
    </div>
  );
}
