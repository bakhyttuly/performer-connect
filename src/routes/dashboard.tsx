import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LayoutDashboard, ShieldCheck, Star, Sparkles, MessageCircle, Calendar, ArrowRight, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth, type AppRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EPBMS" },
      { name: "description", content: "Your EPBMS dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useI18n();
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [becoming, setBecoming] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const role: AppRole = roles.includes("admin")
    ? "admin"
    : roles.includes("performer")
      ? "performer"
      : "client";

  const becomePerformer = async () => {
    setBecoming(true);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "performer" });
    setBecoming(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("dash.becamePerformer"));
      window.location.reload();
    }
  };

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
          <StatCard icon={Calendar} label={t("dash.bookings")} value="0" hint={t("common.soon")} />
          <StatCard icon={MessageCircle} label={t("dash.messages")} value="0" hint={t("common.soon")} />
          <StatCard icon={Star} label={t("dash.favorites")} value="0" hint={t("common.soon")} />
        </div>

        {role === "client" && (
          <div className="mt-10 card-luxe rounded-2xl p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {t("dash.becomeTitle")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("dash.becomeDesc")}</p>
              </div>
              <Button variant="luxe" size="lg" onClick={becomePerformer} disabled={becoming}>
                <Plus className="h-4 w-4" />
                {becoming ? "…" : t("dash.becomeCta")}
              </Button>
            </div>
          </div>
        )}

        {role === "performer" && (
          <div className="mt-10 card-luxe rounded-2xl p-8">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {t("dash.performerTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("dash.performerDesc")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="luxe">
                <Sparkles className="h-4 w-4" />
                {t("dash.editProfile")}
              </Button>
              <Button asChild variant="outlineGold">
                <Link to="/catalog">
                  {t("dash.viewCatalog")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
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
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card-luxe rounded-2xl p-6">
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
}
