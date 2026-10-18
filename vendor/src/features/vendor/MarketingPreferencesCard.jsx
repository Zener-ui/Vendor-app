import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import { getNotificationPrefs, updateNotificationPrefs } from "@/api/preferences";
import { Skeleton } from "@/components/common/Loader";

/**
 * Opt-in for tips and offers as phone notifications. Order, payment and delivery
 * alerts are always sent; tips/offers are only pushed to a phone when this is on
 * (they still appear in the in-app notification list either way).
 */
export default function MarketingPreferencesCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["notification-prefs"], queryFn: getNotificationPrefs });
  const on = !!data?.preferences?.push_marketing;

  const mutation = useMutation({
    mutationFn: (value) => updateNotificationPrefs({ push_marketing: value }),
    onSuccess: (_, value) => {
      toast.success(value ? "You'll get tips and offers as notifications" : "Tips and offers will stay in the app only");
      return qc.invalidateQueries({ queryKey: ["notification-prefs"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="rounded-[22px] border-[2.5px] border-ink bg-white p-4 shadow-pop-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full border-2 border-ink bg-lilac">
            <Megaphone className="h-4 w-4 text-ink" strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-extrabold leading-tight tracking-tight">Tips &amp; offers</p>
            <p className="text-xs font-semibold text-slate-muted">Get them as phone notifications. Order alerts are always on.</p>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-12 rounded-full" />
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Tips and offers as notifications"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(!on)}
            className={`relative h-7 w-12 flex-none rounded-full border-[2.5px] border-ink transition-colors disabled:opacity-60 ${on ? "bg-leaf" : "bg-white"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full border-2 border-ink bg-white transition-all ${on ? "left-[1.35rem]" : "left-0.5"}`} />
          </button>
        )}
      </div>
    </div>
  );
}
