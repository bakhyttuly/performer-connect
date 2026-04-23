import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, ShieldCheck, Star, Sparkles, MessageCircle, Calendar, ArrowRight, Plus, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth, type AppRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { VerificationTimeline, type VerificationStatus } from "@/components/verification-timeline";
import { PerformerScheduleManager } from "@/components/performer-schedule-manager";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EPBMS" },
      { name: "description", content: "Your EPBMS dashboard." },
    ],
  }),
  component: DashboardPage,
});

interface PerformerRow {
  id: string;
  stage_name: string;
  category: string;
  city: string | null;
  price_from: number | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
}

function DashboardPage() {
  const { t } = useI18n();
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [performer, setPerformer] = useState<PerformerRow | null>(null);
  const [perfLoading, setPerfLoading] = useState(true);
  const [counts, setCounts] = useState({ incoming: 0, outgoing: 0 });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setPerfLoading(true);
    Promise.all([
      supabase
        .from("performers")
        .select("id, stage_name, category, city, price_from, verification_status, rejection_reason")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("client_id", user.id),
    ]).then(async ([{ data: p }, { count: outgoing }]) => {
      setPerformer((p as PerformerRow | null) ?? null);
      let incoming = 0;
      if (p) {
        const { count } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("performer_id", p.id);
        incoming = count ?? 0;
      }
      setCounts({ incoming, outgoing: outgoing ?? 0 });
      setPerfLoading(false);
    });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const role: AppRole = roles.includes("admin")
    ? "admin"
    : roles.includes("performer") || performer
      ? "performer"
      : "client";

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">
              EPBMS · {t("nav.dashboard")}
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
              {t("dash.welcome")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <RoleIcon role={role} />
            {t(`role.${role}`)}
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <StatCard
            icon={Calendar}
            label={t("dash.outgoingBookings")}
            value={String(counts.outgoing)}
            href="/bookings"
          />
          <StatCard
            icon={MessageCircle}
            label={t("dash.incomingBookings")}
            value={String(counts.incoming)}
            href={performer ? "/bookings" : undefined}
          />
          <StatCard icon={Star} label={t("dash.favorites")} value="0" hint={t("common.soon")} />
        </div>

        {/* No performer profile yet */}
        {role === "client" && !performer && (
          <div className="mt-10 card-luxe rounded-2xl p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {t("dash.becomeTitle")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("dash.becomeDesc")}</p>
              </div>
              <Button asChild variant="luxe" size="lg">
                <Link to="/performer/apply">
                  <Plus className="h-4 w-4" />
                  {t("dash.becomeCta")}
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Has performer profile — show verification timeline */}
        {performer && (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <VerificationTimeline
              status={performer.verification_status}
              rejectionReason={performer.rejection_reason}
            />
            <div className="card-luxe rounded-2xl p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-primary">
                {t("dash.yourProfile")}
              </div>
              <h3 className="mt-1 font-display text-2xl font-semibold text-foreground">
                {performer.stage_name}
              </h3>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <div>{t(`cat.${performer.category}`)} · {performer.city}</div>
                <div>
                  {t("catalog.from")}{" "}
                  <span className="font-semibold text-foreground">
                    ${performer.price_from?.toLocaleString("en-US")}
                  </span>
                </div>
              </div>
              {performer.verification_status === "rejected" && (
                <Button asChild variant="luxe" className="mt-6">
                  <Link to="/performer/apply">{t("dash.reapply")}</Link>
                </Button>
              )}
              {performer.verification_status === "approved" && (
                <Button asChild variant="outlineGold" className="mt-6">
                  <Link to="/bookings">
                    {t("dash.openBookings")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Schedule manager — only for approved performers */}
        {performer && performer.verification_status === "approved" && (
          <div className="mt-10">
            <PerformerScheduleManager performerId={performer.id} />
          </div>
        )}

        {role === "admin" && (
          <div className="mt-10 card-luxe rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {t("dash.adminTitle")}
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  {t("dash.adminDesc")}
                </p>
                <Button asChild variant="luxe" className="mt-5">
                  <Link to="/admin">
                    {t("nav.admin")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {perfLoading && (
          <div className="mt-10 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

function RoleIcon({ role }: { role: AppRole }) {
  if (role === "admin") return <ShieldCheck className="h-3.5 w-3.5" />;
  if (role === "performer") return <Sparkles className="h-3.5 w-3.5" />;
  return <LayoutDashboard className="h-3.5 w-3.5" />;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="card-luxe rounded-2xl p-6 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        {hint && (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-5 font-display text-3xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
  if (href) {
    return (
      <Link to={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
