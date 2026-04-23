import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
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

function AuthPage() {
  const { t } = useI18n();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [loading, setLoading] = useState(false);

  if (user) {
    // Already signed in — bounce home
    setTimeout(() => navigate({ to: "/" }), 0);
  }

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
    const schema = mode === "signup" ? baseSchema.extend({ fullName: z.string().min(2).max(100) }) : baseSchema;
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("auth.error.generic"));
      return;
    }

    setLoading(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast.error(error);
      } else {
        toast.success(t("auth.success.signin"));
        navigate({ to: "/" });
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      setLoading(false);
      if (error) {
        toast.error(error);
      } else {
        toast.success(t("auth.success.signup"));
      }
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
              <div className="font-display text-xl font-semibold text-gradient-gold">EPBMS</div>
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
                <Input id="fullName" name="fullName" type="text" required minLength={2} maxLength={100} />
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

            <Button type="submit" variant="luxe" size="lg" disabled={loading} className="w-full">
              {loading ? "…" : mode === "signin" ? t("auth.submit.signin") : t("auth.submit.signup")}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? t("auth.toggle.toSignup") : t("auth.toggle.toSignin")}
          </button>
        </div>
      </div>
    </div>
  );
}
