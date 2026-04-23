import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const DEFAULT_SLOTS = ["12:00", "16:00", "20:00"];

interface Props {
  performerId: string;
  /** Selected date (YYYY-MM-DD) */
  value?: string | null;
  onChange?: (date: string, slot: string | null) => void;
  /** Selected slot like "20:00" */
  slot?: string | null;
  /** Compact variant (no slot picker) — used inside the booking dialog */
  hideSlots?: boolean;
}

const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v);

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildGrid(monthStart: Date) {
  const first = new Date(monthStart);
  // Monday-first grid
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function AvailabilityCalendar({
  performerId,
  value,
  onChange,
  slot,
  hideSlots,
}: Props) {
  const { t, lang } = useI18n();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => buildGrid(cursor), [cursor]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (!isUuid(performerId)) {
      setBusy(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    const from = ymd(days[0]);
    const to = ymd(days[days.length - 1]);
    supabase
      .from("performer_availability")
      .select("date")
      .eq("performer_id", performerId)
      .gte("date", from)
      .lte("date", to)
      .then(({ data }) => {
        if (cancelled) return;
        setBusy(new Set((data ?? []).map((r) => r.date as string)));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [performerId, days]);

  const monthLabel = cursor.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = lang === "ru"
    ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleSelect = (d: Date) => {
    if (d < today) return;
    const key = ymd(d);
    if (busy.has(key)) return;
    onChange?.(key, slot ?? null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground"
          aria-label="prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-display text-base font-medium capitalize text-foreground">
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground"
          aria-label="next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {weekDays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const key = ymd(d);
          const isOtherMonth = d.getMonth() !== cursor.getMonth();
          const isPast = d < today;
          const isBusy = busy.has(key);
          const isSelected = value === key;
          const disabled = isPast || isBusy;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(d)}
              className={cn(
                "relative aspect-square rounded-lg text-xs font-medium transition",
                "border border-transparent",
                isOtherMonth && "text-muted-foreground/40",
                !isOtherMonth && !disabled && "text-foreground hover:border-primary/40 hover:bg-primary/5",
                isSelected &&
                  "border-primary/60 bg-[image:var(--gradient-gold)] text-primary-foreground hover:bg-[image:var(--gradient-gold)]",
                isBusy && !isSelected && "cursor-not-allowed bg-destructive/10 text-destructive/70 line-through",
                isPast && !isBusy && "cursor-not-allowed text-muted-foreground/40",
              )}
              aria-label={key}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[image:var(--gradient-gold)]" />
            {t("avail.legend.free")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive/70" />
            {t("avail.legend.busy")}
          </span>
        </div>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
      </div>

      {!hideSlots && value && (
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("avail.timeSlots")}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEFAULT_SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange?.(value, s)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  slot === s
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
