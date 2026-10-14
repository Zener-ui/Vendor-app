import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/common/Card";
import { disablePushNotifications, enablePushNotifications, getPushEnabledState, isPushSupported } from "@/utils/push";

export default function PushDeviceSettings() {
  const supported = isPushSupported();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getPushEnabledState().then((value) => { if (active) setEnabled(value); });
    return () => { active = false; };
  }, []);

  if (!supported) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      if (enabled) {
        await disablePushNotifications();
        const stillEnabled = await getPushEnabledState();
        setEnabled(stillEnabled);
        if (stillEnabled) {
          toast.error("Fidelx could not fully sync the notification setting. Please try again when your connection is stable.");
        } else {
          toast.success("Push notifications disabled on this device.");
        }
        return;
      }

      const result = await enablePushNotifications();
      if (!result?.success) {
        const messages = {
          unsupported: "This device does not support push notifications.",
          denied: "Notifications are blocked for Fidelx. Enable them in your device or browser settings.",
        };
        toast.error(messages[result?.reason] || "Notifications could not be enabled.");
        return;
      }
      setEnabled(await getPushEnabledState());
      toast.success("Push notifications enabled on this device.");
    } catch (error) {
      toast.error(error?.message || "Could not update push notification settings.");
      setEnabled(await getPushEnabledState());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full border-2 border-ink bg-sun">
          <Bell className="h-5 w-5 text-ink" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-extrabold tracking-tight">Push notifications on this device</h3>
          <p className="mt-1 text-xs font-semibold text-slate-muted">Order updates and important account alerts.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Push notifications on this device"
          disabled={loading}
          onClick={toggle}
          className={`relative h-7 w-12 flex-none rounded-full border-[2.5px] border-ink transition-colors disabled:opacity-60 ${enabled ? "bg-brand" : "bg-white"}`}
        >
          <span className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-ink bg-ink transition-all ${enabled ? "right-1" : "left-1"}`} />
        </button>
      </div>
    </Card>
  );
}
