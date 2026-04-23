import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { performerApplicationSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/performer/apply")({
  head: () => ({
    meta: [
      { title: "Become a performer — EPBMS" },
      { name: "description", content: "Apply to join EPBMS as a verified performer." },
    ],
  }),
  component: ApplyPage,
});

const categories = ["singer", "dj", "band", "host", "magic", "show"] as const;

function ApplyPage() {
  const { t } = useI18n();
  const { user, loading: authLoading, hasRole } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [hasExisting, setHasExisting] = useState<boolean | null>(null);
  const [category, setCategory] = useState<(typeof categories)[number]>("singer");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    // Check if user already has a performer record
    supabase
      .from("performers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          navigate({ to: "/dashboard" });
        } else {
          setHasExisting(false);
        }
      });
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    const parsed = performerApplicationSchema.safeParse({
      stage_name: form.get("stage_name"),
      category,
      tagline: form.get("tagline"),
      description: form.get("description"),
      city: form.get("city"),
      price_from: form.get("price_from"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("auth.error.generic"));
      return;
    }

    setSubmitting(true);

    // Ensure performer role exists
    if (!hasRole("performer")) {
      await supabase.from("user_roles").insert({ user_id: user.id, role: "performer" });
    }

    const { error } = await supabase.from("performers").insert({
      user_id: user.id,
      stage_name: parsed.data.stage_name,
      category: parsed.data.category,
      tagline: parsed.data.tagline,
      description: parsed.data.description,
      city: parsed.data.city,
      price_from: parsed.data.price_from,
      price_currency: "USD",
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("apply.submitted"));
    navigate({ to: "/dashboard" });
  };

  if (authLoading || hasExisting === null) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">
          EPBMS · {t("apply.eyebrow")}
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
          {t("apply.title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t("apply.subtitle")}</p>

        <form onSubmit={handleSubmit} className="card-luxe mt-10 space-y-5 rounded-2xl p-6 md:p-8">
          <div className="space-y-1.5">
            <Label htmlFor="stage_name">{t("apply.stageName")}</Label>
            <Input id="stage_name" name="stage_name" required minLength={2} maxLength={80} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("apply.category")}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`cat.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">{t("apply.city")}</Label>
              <Input id="city" name="city" required minLength={2} maxLength={80} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline">{t("apply.tagline")}</Label>
            <Input
              id="tagline"
              name="tagline"
              required
              minLength={4}
              maxLength={120}
              placeholder={t("apply.taglinePh")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{t("apply.description")}</Label>
            <Textarea
              id="description"
              name="description"
              required
              minLength={20}
              maxLength={2000}
              rows={5}
              placeholder={t("apply.descriptionPh")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price_from">{t("apply.priceFrom")} (USD)</Label>
            <Input
              id="price_from"
              name="price_from"
              type="number"
              required
              min={50}
              max={1000000}
              step={10}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("common.cancel")}
            </Link>
            <Button type="submit" variant="luxe" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {t("apply.submit")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
