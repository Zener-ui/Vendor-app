import { Capacitor } from "@capacitor/core";

// One reliable "where am I" call for every app.
//  - Native Android/iOS: uses the Capacitor Geolocation plugin, which asks for
//    the OS permission itself and reports "location services off" clearly. The
//    plain WebView API asks for permission but can then sit silently until it
//    times out (that was the "it asks but never uses it" bug).
//  - Browser/PWA: standard navigator.geolocation.
// It tries high accuracy (GPS) first and falls back to a quick network/cached
// fix, so people indoors still get a position within seconds.
// Rejects with an Error whose .code is one of:
//   "permission_denied" | "services_off" | "timeout" | "unavailable" | "unsupported"

const fail = (code, cause) => Object.assign(new Error(code), { code, cause });

const classify = (err) => {
  const msg = String(err?.message || err || "").toLowerCase();
  if (err?.code === 1 || msg.includes("denied") || msg.includes("permission")) return "permission_denied";
  if (msg.includes("not enabled") || msg.includes("disabled") || msg.includes("location services")) return "services_off";
  if (err?.code === 3 || msg.includes("timeout") || msg.includes("timed out")) return "timeout";
  return "unavailable";
};

const webPosition = (options) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(fail("unsupported"));
    navigator.geolocation.getCurrentPosition(resolve, (e) => reject(fail(classify(e), e)), options);
  });

export async function getCurrentCoords() {
  let getPosition = webPosition;

  if (Capacitor.isNativePlatform()) {
    const { Geolocation } = await import("@capacitor/geolocation");
    const granted = (p) => p?.location === "granted" || p?.coarseLocation === "granted";
    let perm = await Geolocation.checkPermissions().catch(() => null);
    if (!granted(perm)) {
      try {
        perm = await Geolocation.requestPermissions({ permissions: ["location", "coarseLocation"] });
      } catch (e) {
        throw fail("permission_denied", e);
      }
    }
    if (!granted(perm)) throw fail("permission_denied");
    getPosition = (options) =>
      Geolocation.getCurrentPosition(options).catch((e) => {
        throw fail(classify(e), e);
      });
  }

  let pos;
  try {
    pos = await getPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  } catch (e) {
    if (["permission_denied", "unsupported", "services_off"].includes(e.code)) throw e;
    pos = await getPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 120000 });
  }
  return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
}
