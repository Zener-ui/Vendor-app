import { clsx } from "clsx";

export default function Loader({ fullscreen = false, size = "md", text }) {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-3" };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-brand" role="status" aria-live="polite">
        <img
          src="/apple-touch-icon.png"
          alt=""
          className="h-24 w-24 animate-pulse rounded-[22px] border-[3px] border-ink shadow-[5px_5px_0_rgb(var(--c-ink))]"
        />
        <div className="flex gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-3 w-3 animate-bounce rounded-full border-[2.5px] border-ink bg-white"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        {text && <p className="text-sm font-bold text-ink">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={clsx("rounded-full border-teal border-t-transparent animate-spin", sizes[size])} />
      {text && <p className="text-slate-muted text-sm">{text}</p>}
    </div>
  );
}

// Skeleton shimmer for content loading
export function Skeleton({ className = "" }) {
  return (
    <div className={clsx(
      "bg-surface-raised rounded-xl animate-pulse pop:bg-peach",
      className
    )} />
  );
}
