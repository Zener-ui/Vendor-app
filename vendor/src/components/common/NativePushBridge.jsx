import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

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

export default function NativePushBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let disposed = false;
    let actionHandle;
    (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        actionHandle = await PushNotifications.addListener("pushNotificationActionPerformed", (event) => {
          if (disposed) return;
          navigate(safeDestination(event?.notification?.data), { replace: false });
        });
        if (disposed) await actionHandle.remove();
      } catch (error) {
        // Push is optional during local development and before Firebase setup.
        console.warn("Fidelx native push action listener unavailable", error);
      }
    })();
    return () => {
      disposed = true;
      actionHandle?.remove?.();
    };
  }, [navigate]);
  return null;
}
