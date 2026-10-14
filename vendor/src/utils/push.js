import { Capacitor } from "@capacitor/core";
import { getVapidKey, savePushSubscription, removePushSubscription, registerFcmToken, unregisterFcmToken } from "@/api/push";

export const isNativePush = () => Capacitor.isNativePlatform();

export const isPushSupported = () =>
  isNativePush() || ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window);

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

const enableNativePush = async () => {
  const { PushNotifications } = await import("@capacitor/push-notifications");

  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === "prompt") {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== "granted") return { success: false, reason: "denied" };

  await PushNotifications.createChannel({
    id: "fidelx-orders",
    name: "Order updates",
    description: "Updates about Fidelx orders, payments and deliveries.",
    importance: 4,
    visibility: 1,
  });
  await PushNotifications.createChannel({
    id: "fidelx-promotions",
    name: "Fidelx promotions",
    description: "Optional promotional messages from Fidelx.",
    importance: 3,
    visibility: 1,
  });

  const registration = await new Promise((resolve, reject) => {
    let settled = false;
    let registrationHandle;
    let errorHandle;
    const cleanup = async () => {
      await registrationHandle?.remove?.();
      await errorHandle?.remove?.();
    };
    (async () => {
      registrationHandle = await PushNotifications.addListener("registration", async (token) => {
        if (settled) return;
        settled = true;
        await cleanup();
        resolve(token);
      });
      errorHandle = await PushNotifications.addListener("registrationError", async (error) => {
        if (settled) return;
        settled = true;
        await cleanup();
        reject(new Error(error?.error || "Firebase push registration failed."));
      });
      await PushNotifications.register();
    })().catch(async (error) => {
      if (settled) return;
      settled = true;
      await cleanup();
      reject(error);
    });
  });

  if (!registration?.value) throw new Error("Firebase did not return a device token.");
  const saved = await registerFcmToken(registration.value);
  if (!saved?.success) throw new Error(saved?.message || "The server could not save this device for notifications.");
  localStorage.setItem(`fidelx_fcm_token_${import.meta.env.VITE_APP_ROLE || "customer"}`, registration.value);
  return { success: true };
};

// Requests permission and enables push for either the native Capacitor app
// or the existing browser/PWA implementation.
export const enablePushNotifications = async () => {
  if (isNativePush()) return enableNativePush();
  if (!("serviceWorker" in navigator && "PushManager" in window && "Notification" in window)) {
    return { success: false, reason: "unsupported" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { success: false, reason: "denied" };

  const vapidData = await getVapidKey();
  if (!vapidData?.success || !vapidData?.key) {
    throw new Error(vapidData?.message || "Push notifications are not configured on the server.");
  }

  let registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidData.key),
  });

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("The browser did not return a valid push subscription.");
  }

  const saved = await savePushSubscription({ endpoint: json.endpoint, keys: json.keys });
  if (!saved?.success) throw new Error(saved?.message || "The server could not save this device for notifications.");
  return { success: true };
};

export const disablePushNotifications = async () => {
  if (isNativePush()) {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const role = import.meta.env.VITE_APP_ROLE || "customer";
    const tokenKey = `fidelx_fcm_token_${role}`;
    const token = localStorage.getItem(tokenKey);
    if (token) {
      const result = await unregisterFcmToken(token);
      if (!result?.success) throw new Error(result?.message || "The server could not remove this device from push notifications.");
      localStorage.removeItem(tokenKey);
    }
    await PushNotifications.unregister();
    return;
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  await removePushSubscription(subscription.endpoint);
  await subscription.unsubscribe();
};

export const getPushPermissionState = async () => {
  if (isNativePush()) {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const status = await PushNotifications.checkPermissions();
    return status.receive;
  }
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
};


export const getPushEnabledState = async () => {
  if (isNativePush()) {
    const role = import.meta.env.VITE_APP_ROLE || "customer";
    const token = localStorage.getItem(`fidelx_fcm_token_${role}`);
    const permission = await getPushPermissionState();
    return Boolean(token) && permission === "granted";
  }
  if (!("serviceWorker" in navigator && "PushManager" in window)) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    return Boolean(await registration?.pushManager?.getSubscription());
  } catch { return false; }
};
