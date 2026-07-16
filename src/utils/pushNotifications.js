import { supabase } from "../lib/supabaseClient";

// This is the "public key" half of your app's notification signature.
// It's safe for this to be visible in the app code.
const VAPID_PUBLIC_KEY = "BJNj099MTrEJ8uwgo5wACot2XKiaQPjda8EPfLDouL216qBgCxTYNvujTB8EAUDPy-75ySZExlSzefwX_lOMCI0";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export async function getCurrentSubscriptionStatus() {
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  return existing ? "subscribed" : "not-subscribed";
}

export async function enablePushNotifications(userId) {
  if (!isPushSupported()) {
    throw new Error("Push notifications aren't supported on this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const deviceHint = isIOS() ? "iOS" : /Android/i.test(navigator.userAgent) ? "Android" : "Desktop";

  // Clear out any old subscription rows for this user first, then insert a
  // fresh one. This avoids relying on a fragile upsert-match on the
  // subscription JSON, which can fail to match after a device
  // unsubscribes and resubscribes with a new endpoint.
  await supabase.from("push_subscriptions").delete().eq("user_id", userId);

  const { error } = await supabase.from("push_subscriptions").insert({
    user_id: userId,
    subscription: subscription.toJSON(),
    device_hint: deviceHint,
  });

  if (error) throw error;

  return subscription;
}

export async function disablePushNotifications(userId) {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await supabase.from("push_subscriptions").delete().eq("user_id", userId);
    await subscription.unsubscribe();
  }
}
