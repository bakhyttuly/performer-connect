import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2, Plus, Users, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth, type AppRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/components/verification-timeline";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — EPBMS" },
      { name: "description", content: "EPBMS admin panel." },
    ],
  }),
  component: AdminPage,
});

interface UserRow {
  id: string;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
}

interface PerformerRow {
  id: string;
  user_id: string;
  stage_name: string;
  category: string;
  city: string | null;
  tagline: string | null;
  description: string | null;
  price_from: number | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  created_at: string;
}

type Tab = "queue" | "users";

function AdminPage() {
  const { t } = useI18n();
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("queue");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [performers, setPerformers] = useState<PerformerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!hasRole("admin")) {
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, user, hasRole, navigate]);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: perfs }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase
        .from("performers")
        .select("id, user_id, stage_name, category, city, tagline, description, price_from, verification_status, rejection_reason, created_at")
        .order("created_at", { ascending: false }),
    ]);
    const rolesByUser = new Map<string, AppRole[]>();
    (roles ?? []).forEach((r) => {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role as AppRole);
      rolesByUser.set(r.user_id, arr);
    });
    setUsers(
      (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        created_at: p.created_at,
        roles: rolesByUser.get(p.id) ?? [],
      })),
    );
    setPerformers((perfs as PerformerRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (hasRole("admin")) load();
  }, [hasRole]);

  const grant = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message);
    else { toast.success(t("admin.granted")); load(); }
  };

  const revoke = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) toast.error(error.message);
    else { toast.success(t("admin.revoked")); load(); }
  };

  const setStatus = async (id: string, status: VerificationStatus, reason?: string) => {
    const { error } = await supabase
      .from("performers")
      .update({ verification_status: status, rejection_reason: status === "rejected" ? reason ?? null : null })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(t(`admin.verify.${status}`));
      load();
    }
  };

  if (authLoading || !user || !hasRole("admin")) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const pending = performers.filter((p) => p.verification_status === "pending");
  const approved = performers.filter((p) => p.verification_status === "approved");
  const rejected = performers.filter((p) => p.verification_status === "rejected");

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              EPBMS · Admin
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
              {t("admin.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("admin.subtitle")}</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/dashboard">{t("nav.dashboard")}</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          <Stat label={t("admin.totalUsers")} value={String(users.length)} />
          <Stat label={t("admin.pending")} value={String(pending.length)} accent />
          <Stat label={t("admin.approved")} value={String(approved.length)} />
          <Stat label={t("admin.totalAdmins")} value={String(users.filter((u) => u.roles.includes("admin")).length)} />
        </div>

        {/* Tabs */}
        <div className="mt-10 inline-flex rounded-full border border-border/60 p-1">
          {(["queue", "users"] as Tab[]).map((tk) => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                tab === tk ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`admin.tab.${tk}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 grid place-items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : tab === "queue" ? (
          <div className="mt-8 space-y-8">
            <QueueSection
              title={t("admin.pending")}
              icon={<Clock className="h-4 w-4 text-primary" />}
              items={pending}
              onApprove={(id) => setStatus(id, "approved")}
              onReject={(id) => {
                const reason = window.prompt(t("admin.rejectPrompt")) ?? "";
                if (reason.trim().length === 0) return;
                setStatus(id, "rejected", reason.trim().slice(0, 500));
              }}
            />
            <QueueSection
              title={t("admin.approved")}
              icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
              items={approved}
              onReject={(id) => {
                const reason = window.prompt(t("admin.rejectPrompt")) ?? "";
                if (reason.trim().length === 0) return;
                setStatus(id, "rejected", reason.trim().slice(0, 500));
              }}
            />
            {rejected.length > 0 && (
              <QueueSection
                title={t("admin.rejected")}
                icon={<XCircle className="h-4 w-4 text-destructive" />}
                items={rejected}
                onApprove={(id) => setStatus(id, "approved")}
              />
            )}
          </div>
        ) : (
          <div className="mt-8 card-luxe rounded-2xl">
            <div className="flex items-center gap-3 border-b border-border/40 px-6 py-4">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                {t("admin.users")}
              </h2>
            </div>
            <div className="divide-y divide-border/40">
              {users.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{u.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}…</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(["client", "performer", "admin"] as AppRole[]).map((r) => {
                      const has = u.roles.includes(r);
                      return (
                        <button
                          key={r}
                          onClick={() => (has ? revoke(u.id, r) : grant(u.id, r))}
                          className={
                            has
                              ? "inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-destructive/20 hover:text-destructive"
                              : "inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                          }
                          title={has ? t("admin.revoke") : t("admin.grant")}
                        >
                          {has ? <Trash2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          {t(`role.${r}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  {t("admin.empty")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QueueSection({
  title,
  icon,
  items,
  onApprove,
  onReject,
}: {
  title: string;
  icon: React.ReactNode;
  items: PerformerRow[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const { t } = useI18n();
  if (items.length === 0) return null;
  return (
    <div className="card-luxe rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 px-6 py-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
        </div>
        <span className="rounded-full bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
          {items.length}
        </span>
      </div>
      <div className="divide-y divide-border/40">
        {items.map((p) => (
          <div key={p.id} className="px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg font-semibold text-foreground">
                  {p.stage_name}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t(`cat.${p.category}`)} · {p.city ?? "—"} · ${p.price_from?.toLocaleString("en-US")}
                </div>
                {p.tagline && (
                  <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                )}
                {p.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground/80 line-clamp-3">
                    {p.description}
                  </p>
                )}
                {p.rejection_reason && (
                  <p className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                    {p.rejection_reason}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {onReject && (
                  <Button variant="ghost" size="sm" onClick={() => onReject(p.id)}>
                    <XCircle className="h-3.5 w-3.5" />
                    {t("admin.reject")}
                  </Button>
                )}
                {onApprove && (
                  <Button variant="luxe" size="sm" onClick={() => onApprove(p.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("admin.approve")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-luxe rounded-2xl p-6">
      <div
        className={cn(
          "font-display text-3xl font-semibold",
          accent ? "text-gradient-gold" : "text-foreground",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
