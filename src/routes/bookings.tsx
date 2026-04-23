import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar, MapPin, MessageCircle, Loader2, Inbox } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/mock-data";

type BookingStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled";

interface BookingRow {
  id: string;
  performer_id: string;
  client_id: string;
  event_date: string;
  location: string;
  budget: number | null;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  performer_name?: string;
}

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — EPBMS" },
      { name: "description", content: "Track your bookings on EPBMS." },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { t, lang } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"client" | "performer">("client");

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    // Two queries: as client / as performer
    const [{ data: asClient }, { data: ownPerf }] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, performer_id, client_id, event_date, location, budget, message, status, created_at, performers(stage_name)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("performers").select("id, stage_name").eq("user_id", user.id).maybeSingle(),
    ]);

    let asPerformer: any[] = [];
    if (ownPerf) {
      const { data } = await supabase
        .from("bookings")
        .select("id, performer_id, client_id, event_date, location, budget, message, status, created_at, performers(stage_name)")
        .eq("performer_id", ownPerf.id)
        .order("created_at", { ascending: false });
      asPerformer = data ?? [];
    }

    const map = (rows: any[]): BookingRow[] =>
      rows.map((r) => ({
        ...r,
        performer_name: r.performers?.stage_name ?? "—",
      }));

    setBookings(tab === "client" ? map(asClient ?? []) : map(asPerformer));
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("bookings.updated"));
    load();
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">
              EPBMS · {t("bookings.title")}
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
              {t("bookings.heading")}
            </h1>
          </div>
          <Button asChild variant="ghost">
            <Link to="/dashboard">{t("nav.dashboard")}</Link>
          </Button>
        </div>

        <div className="mt-8 inline-flex rounded-full border border-border/60 p-1">
          {(["client", "performer"] as const).map((tk) => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                tab === tk ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`bookings.tab.${tk}`)}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="card-luxe rounded-2xl p-12 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">{t("bookings.empty")}</p>
              <Button asChild variant="luxe" className="mt-6">
                <Link to="/catalog">{t("hero.cta.browse")}</Link>
              </Button>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="card-luxe rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-lg font-semibold text-foreground">
                      {b.performer_name}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(b.event_date).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US")}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {b.location}
                      </span>
                      {b.budget && (
                        <span>
                          {t("catalog.from")}{" "}
                          <span className="font-semibold text-foreground">
                            ${formatPrice(b.budget)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>

                {b.message && (
                  <p className="mt-4 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                    <MessageCircle className="mr-1.5 inline h-3.5 w-3.5" />
                    {b.message}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                  {tab === "client" && b.status === "pending" && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(b.id, "cancelled")}>
                      {t("bookings.cancel")}
                    </Button>
                  )}
                  {tab === "performer" && b.status === "pending" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(b.id, "declined")}>
                        {t("bookings.decline")}
                      </Button>
                      <Button variant="luxe" size="sm" onClick={() => updateStatus(b.id, "accepted")}>
                        {t("bookings.accept")}
                      </Button>
                    </>
                  )}
                  {tab === "performer" && b.status === "accepted" && (
                    <Button variant="luxe" size="sm" onClick={() => updateStatus(b.id, "completed")}>
                      {t("bookings.markCompleted")}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useI18n();
  const cls: Record<BookingStatus, string> = {
    pending: "bg-muted text-muted-foreground",
    accepted: "bg-primary/15 text-primary",
    declined: "bg-destructive/15 text-destructive",
    completed: "bg-emerald-500/15 text-emerald-400",
    cancelled: "bg-destructive/10 text-destructive/80",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider",
        cls[status],
      )}
    >
      {t(`bookings.status.${status}`)}
    </span>
  );
}
