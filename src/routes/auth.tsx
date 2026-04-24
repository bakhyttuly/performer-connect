import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — EPBMS" },
      { name: "description", content: "Sign in or create an EPBMS account." },
    ],
  }),
  component: AuthPage,
});

/** Quick role check that does NOT depend on the AuthProvider state (which only
 *  refreshes on the next render). Used to redirect admins immediately after
 *  successful sign-in. */
async function isAdminUser(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

function AuthPage() {
  const { t } = useI18n();
  const { signIn, signUp, user, hasRole } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [loading, setLoading] = useState(false);

  // Already-signed-in users get bounced to the right place.
  useEffect(() => {
    if (!user) return;
    navigate({ to: hasRole("admin") ? "/admin" : "/dashboard" });
  }, [user, hasRole, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "");

    const baseSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });
    const schema =
      mode === "signup"
        ? baseSchema.extend({ fullName: z.string().min(2).max(100) })
        : baseSchema;
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("auth.error.generic"));
      return;
    }

    setLoading(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) {
        setLoading(false);
        toast.error(error);
        return;
      }
      // Pull current user fresh from Supabase to read the actual id
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      const admin = uid ? await isAdminUser(uid) : false;
      setLoading(false);
      toast.success(t("auth.success.signin"));
      navigate({ to: admin ? "/admin" : "/dashboard" });
    } else {
      const { error } = await signUp(email, password, fullName);
      setLoading(false);
      if (error) toast.error(error);
      else toast.success(t("auth.success.signup"));
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-16 md:px-8">
      <div className="w-full max-w-md">
        <div className="card-luxe rounded-2xl p-8 md:p-10 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-gold)] text-primary-foreground">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-xl font-semibold text-gradient-gold">
                EPBMS
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {mode === "signin" ? t("auth.signin.title") : t("auth.signup.title")}
              </div>
            </div>
          </div>

          <h1 className="mt-8 font-display text-3xl font-semibold text-foreground">
            {mode === "signin" ? t("auth.signin.title") : t("auth.signup.title")}
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>

            <Button
              type="submit"
              variant="luxe"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "…"
                : mode === "signin"
                  ? t("auth.submit.signin")
                  : t("auth.submit.signup")}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? t("auth.toggle.toSignup") : t("auth.toggle.toSignin")}
          </button>

          {/* Admin shortcut */}
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-[0.18em] text-primary">
                  {t("nav.admin")}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("auth.adminHint")}
                </p>
                <Button asChild variant="outlineGold" size="sm" className="mt-3">
                  <Link to="/admin">{t("auth.openAdmin")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
