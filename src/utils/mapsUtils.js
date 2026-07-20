// Google Maps distance lookup for Zero Contract.
// Uses the Maps JavaScript API (works in browsers with referrer-restricted keys).

const MAPS_KEY = "AIzaSyCsIxK_wXb-8EVhYFfBCDmtCkJZl8rxFws";

let loadPromise = null;

export function loadMaps() {
  if (window.google && window.google.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + MAPS_KEY + "&libraries=places";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load Google Maps. Check your connection."));
    document.head.appendChild(script);
  });
  return loadPromise;
}

// Looks up the one-way distance between two addresses.
// mode: "driving" or "transit"
export async function getDistance(homeAddress, workAddress, mode) {
  await loadMaps();
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [homeAddress],
        destinations: [workAddress],
        travelMode:
          mode === "transit"
            ? window.google.maps.TravelMode.TRANSIT
            : mode === "walking"
            ? window.google.maps.TravelMode.WALKING
            : window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status !== "OK") {
          reject(new Error("Distance lookup failed (" + status + "). Try again in a moment."));
          return;
        }
        const el = response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0];
        if (!el || el.status !== "OK") {
          reject(new Error("Couldn't find a route between those addresses. Check the spelling and include the town or postcode."));
          return;
        }
        resolve({
          distanceKm: Math.round((el.distance.value / 1000) * 10) / 10,
          durationText: el.duration.text,
          fare: el.fare ? el.fare.value : null,
        });
      }
    );
  });
}

// Attaches Google's address suggestions dropdown to a text input.
// As the user types, real addresses appear; picking one calls onSelect with it.
export async function attachAutocomplete(inputEl, onSelect) {
  try {
    await loadMaps();
    if (!inputEl || !window.google?.maps?.places?.Autocomplete) return;
    const ac = new window.google.maps.places.Autocomplete(inputEl, {
      fields: ["formatted_address"],
      componentRestrictions: { country: "gb" },
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place && place.formatted_address) onSelect(place.formatted_address);
    });
  } catch (err) {
    // If Maps fails to load, the input still works as a normal text box.
  }
}

// Converts a one-way distance into an estimated ROUND TRIP cost in GBP.
// Driving: 45p per mile (about 28p per km), both ways.
// Transit: uses Google's fare if known (both ways); otherwise returns null
// so the user can type the real fare themselves.
export function estimateTravelCost(distanceKm, mode, fare) {
  if (mode === "walking") return 0;
  if (mode === "transit") {
    if (fare != null) return Math.round(fare * 2 * 100) / 100;
    return null;
  }
  return Math.round(distanceKm * 0.28 * 2 * 100) / 100;
}
