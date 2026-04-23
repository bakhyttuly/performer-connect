import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Row {
  id: string;
  date: string;
  status: string;
  note: string | null;
}

interface Props {
  performerId: string;
}

/** Lets a performer block dates manually. Auto-managed dates from accepted bookings are also shown. */
export function PerformerScheduleManager({ performerId }: Props) {
  const { t, lang } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState("");

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("performer_availability")
      .select("id, date, status, note")
      .eq("performer_id", performerId)
      .gte("date", todayIso)
      .order("date", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (performerId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performerId]);

  const handleAdd = async () => {
    if (!date) return;
    setAdding(true);
    const { error } = await supabase.from("performer_availability").insert({
      performer_id: performerId,
      date,
      status: "blocked",
      note: "Manual",
    });
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDate("");
    toast.success(t("schedule.added"));
    load();
  };

  const handleRemove = async (id: string, note: string | null) => {
    if (note === "Booked") {
      toast.error(t("schedule.cantRemoveBooked"));
      return;
    }
    const { error } = await supabase.from("performer_availability").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("schedule.removed"));
    load();
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="card-luxe rounded-2xl p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-primary">
        {t("schedule.title")}
      </div>
      <h3 className="mt-1 font-display text-2xl font-semibold text-foreground">
        {t("schedule.heading")}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("schedule.desc")}</p>

      <div className="mt-5 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <Input
            type="date"
            value={date}
            min={todayIso}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Button variant="luxe" onClick={handleAdd} disabled={!date || adding}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("schedule.block")}
        </Button>
      </div>

      <div className="mt-5 space-y-2">
        {loading ? (
          <div className="grid place-items-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
            {t("schedule.empty")}
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-4 py-2.5"
            >
              <div>
                <div className="text-sm font-medium text-foreground">{fmt(r.date)}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {r.note === "Booked" ? t("schedule.booked") : t("schedule.blocked")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(r.id, r.note)}
                className="text-muted-foreground transition hover:text-destructive disabled:opacity-40"
                disabled={r.note === "Booked"}
                aria-label="remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
