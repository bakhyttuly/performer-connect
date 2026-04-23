import type { CategoryKey } from "@/lib/mock-data";
import { categoryIcons, getInitials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  category: CategoryKey;
  gradient: [string, string];
  className?: string;
  /** large hero variant for profile page */
  variant?: "card" | "hero";
}

/**
 * Brand-driven cover that replaces AI images.
 * Uses category gradient, initials and category icon — premium and SSR-safe.
 */
export function PerformerCover({ name, category, gradient, className, variant = "card" }: Props) {
  const Icon = categoryIcons[category];
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 20% 0%, ${gradient[0]} 0%, ${gradient[1]} 70%)`,
      }}
    >
      {/* gold halo */}
      <div
        aria-hidden
        className="absolute -top-1/4 left-1/2 h-[140%] w-[140%] -translate-x-1/2 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--gold) 30%, transparent) 0%, transparent 55%)",
        }}
      />
      {/* subtle grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* center monogram */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "font-display font-semibold leading-none tracking-tight text-gradient-gold drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
            variant === "hero" ? "text-[12rem] md:text-[18rem]" : "text-[7rem]",
          )}
        >
          {initials}
        </div>
      </div>

      {/* category icon corner */}
      <div className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-xl border border-primary/30 bg-background/40 text-primary backdrop-blur-md">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
    </div>
  );
}
