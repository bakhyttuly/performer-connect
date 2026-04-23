import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2, Plus, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth, type AppRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

function AdminPage() {
  const { t } = useI18n();
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
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
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
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
    setLoading(false);
  };

  useEffect(() => {
    if (hasRole("admin")) load();
  }, [hasRole]);

  const grant = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message);
    else {
      toast.success(t("admin.granted"));
      load();
    }
  };

  const revoke = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);
    if (error) toast.error(error.message);
    else {
      toast.success(t("admin.revoked"));
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

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
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

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Stat label={t("admin.totalUsers")} value={String(users.length)} />
          <Stat label={t("admin.totalPerformers")} value={String(users.filter((u) => u.roles.includes("performer")).length)} />
          <Stat label={t("admin.totalAdmins")} value={String(users.filter((u) => u.roles.includes("admin")).length)} />
        </div>

        <div className="mt-10 card-luxe rounded-2xl">
          <div className="flex items-center gap-3 border-b border-border/40 px-6 py-4">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("admin.users")}
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {users.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">
                      {u.full_name ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {u.id.slice(0, 8)}…
                    </div>
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
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-luxe rounded-2xl p-6">
      <div className="font-display text-3xl font-semibold text-gradient-gold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
