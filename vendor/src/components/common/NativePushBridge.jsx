import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import queryClient from "@/queryClient";
import { useAuthStore } from "@/store/authStore";
import { autoRegisterNativePush } from "@/utils/push";

const ROLE = import.meta.env.VITE_APP_ROLE || "customer";
const ROLE_HOME = {
  customer: "/customer/notifications",
  vendor: "/vendor/notifications",
  rider: "/rider/notifications",
  admin: "/admin/notifications",
};
const ROLE_PREFIX = {
  customer: "/customer/",
  vendor: "/vendor/",
  rider: "/rider/",
  admin: "/admin/",
};

function safeDestination(data = {}) {
  const candidate = data.target_path || data.route || data.url || data.data?.target_path || data.data?.route || data.data?.url;
  if (typeof candidate !== "string" || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return ROLE_HOME[ROLE] || "/login";
  }
  // Native apps must not follow external URLs or jump across role dashboards.
  if (!candidate.startsWith(ROLE_PREFIX[ROLE])) return ROLE_HOME[ROLE] || "/login";
  return candidate;
}

const locationAskedKey = (userId) => `fidelx_location_asked_${userId}`;

export default function NativePushBridge() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const userRole = user?.role;

  // Register this device for push right after login (and on every launch),
  // instead of waiting for the user to tap an optional prompt card.
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !userId || userRole !== ROLE) return;
    (async () => {
      try {
        await autoRegisterNativePush(userId);
      } catch (error) {
        console.warn("Fidelx push registration failed", error);
      }
      // Riders share live position during deliveries; trigger the Android
      // location permission dialog once, up front, instead of mid-delivery.
      if (ROLE === "rider" && "geolocation" in navigator && localStorage.getItem(locationAskedKey(userId)) !== "1") {
        localStorage.setItem(locationAskedKey(userId), "1");
        navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 15000 });
      }
    })();
  }, [userId, userRole]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let disposed = false;
    let actionHandle;
    let receivedHandle;
    (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        actionHandle = await PushNotifications.addListener("pushNotificationActionPerformed", (event) => {
          if (disposed) return;
          navigate(safeDestination(event?.notification?.data), { replace: false });
        });
        // App is open: the OS does not show a tray notification, so refresh
        // the in-app notification list/badge instead.
        receivedHandle = await PushNotifications.addListener("pushNotificationReceived", () => {
          if (disposed) return;
          void queryClient.invalidateQueries({ queryKey: ["notifications"] });
          void queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
        });
        if (disposed) {
          await actionHandle.remove();
          await receivedHandle.remove();
        }
      } catch (error) {
        // Push is optional during local development and before Firebase setup.
        console.warn("Fidelx native push action listener unavailable", error);
      }
    })();
    return () => {
      disposed = true;
      actionHandle?.remove?.();
      receivedHandle?.remove?.();
    };
  }, [navigate]);
  return null;
}
