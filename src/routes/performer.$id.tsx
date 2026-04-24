import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  BadgeCheck,
  MessageCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { mockPerformers, mockReviews, formatPrice } from "@/lib/mock-data";
import { PerformerCover } from "@/components/performer-cover";
import { BookingDialog } from "@/components/booking-dialog";
import { AvailabilityCalendar } from "@/components/availability-calendar";

import { supabase } from "@/integrations/supabase/client";
import type { CategoryKey } from "@/lib/mock-data";

interface LoadedPerformer {
  id: string;
  stage_name: string;
  category: CategoryKey;
  tagline: { ru: string; en: string };
  description: { ru: string; en: string };
  gradient: [string, string];
  city: { ru: string; en: string };
  price_from: number;
  rating: number;
  reviews_count: number;
  verified: boolean;
}

interface DbReview {
  id: string;
  rating: number;
  text: string | null;
  created_at: string;
  client_id: string;
  author_name?: string;
}

const fallbackGradients: Record<string, [string, string]> = {
  singer: ["#3a2410", "#0f0a06"],
  dj: ["#2a1c08", "#0a0805"],
  band: ["#3d2a14", "#0d0905"],
  host: ["#33240e", "#0c0805"],
  magic: ["#241a0a", "#080604"],
  show: ["#2e1f0c", "#090604"],
};

export const Route = createFileRoute("/performer/$id")({
  loader: async ({ params }) => {
    const mockMatch = mockPerformers.find((p) => p.id === params.id);
    if (mockMatch) return { performer: mockMatch as LoadedPerformer, isUuid: false };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(params.id);
    if (!isUuid) throw notFound();
    const { data } = await supabase
      .from("performers")
      .select(
        "id, stage_name, category, tagline, description, city, price_from, rating, reviews_count, is_verified, is_published, verification_status",
      )
      .eq("id", params.id)
      .maybeSingle();
    if (!data || data.verification_status !== "approved") throw notFound();
    const cat = (data.category as CategoryKey) ?? "show";
    const performer: LoadedPerformer = {
      id: data.id,
      stage_name: data.stage_name,
      category: cat,
      tagline: { ru: data.tagline ?? "", en: data.tagline ?? "" },
      description: { ru: data.description ?? "", en: data.description ?? "" },
      gradient: fallbackGradients[cat] ?? fallbackGradients.show,
      city: { ru: data.city ?? "", en: data.city ?? "" },
      price_from: data.price_from ?? 0,
      rating: Number(data.rating ?? 0),
      reviews_count: data.reviews_count ?? 0,
      verified: !!data.is_verified,
    };
    return { performer, isUuid: true };
  },
  notFoundComponent: NotFound,
  component: PerformerPage,
});

function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="font-display text-4xl text-foreground">{t("profile.notFound")}</h1>
      <Button asChild variant="luxe" className="mt-6">
        <Link to="/catalog">{t("profile.backToCatalog")}</Link>
      </Button>
    </div>
  );
}

function PerformerPage() {
  const { t, lang } = useI18n();
  const { performer, isUuid } = Route.useLoaderData();
  const mockReviewsForPerformer = mockReviews.filter((r) => r.performerId === performer.id);

  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [dbReviews, setDbReviews] = useState<DbReview[]>([]);
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  // Load real reviews + completed bookings count for UUID-based performers
  useEffect(() => {
    if (!isUuid) return;
    let cancelled = false;
    (async () => {
      const [{ data: reviews }, { count }] = await Promise.all([
        supabase
          .from("reviews")
          .select("id, rating, text, created_at, client_id")
          .eq("performer_id", performer.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("performer_id", performer.id)
          .eq("status", "completed"),
      ]);
      if (cancelled) return;
      const ids = Array.from(new Set((reviews ?? []).map((r) => r.client_id)));
      let nameMap = new Map<string, string>();
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);
        nameMap = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? "—"]));
      }
      setDbReviews(
        (reviews ?? []).map((r) => ({
          ...r,
          author_name: nameMap.get(r.client_id) ?? "Guest",
        })),
      );
      setCompletedCount(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [isUuid, performer.id]);

  const includes = [
    t("profile.includes.1"),
    t("profile.includes.2"),
    t("profile.includes.3"),
    t("profile.includes.4"),
  ];

  return (
    <div>
      {/* Cover */}
      <section className="relative h-[60vh] min-h-[440px] overflow-hidden">
        <PerformerCover
          name={performer.stage_name}
          category={performer.category}
          gradient={performer.gradient}
          variant="hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background" />

        <div className="container relative mx-auto h-full px-4 md:px-8">
          <Link
            to="/catalog"
            className="absolute left-4 top-6 inline-flex items-center gap-2 rounded-full surface-glass px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground md:left-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("profile.backToCatalog")}
          </Link>

          <div className="absolute bottom-10 left-4 right-4 md:left-8 md:right-8">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <span>{t(`cat.${performer.category}`)}</span>
              {performer.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-primary">
                  <BadgeCheck className="h-3 w-3" /> {t("catalog.verified")}
                </span>
              )}
              <span className="hidden items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-foreground/80 sm:inline-flex">
                <Sparkles className="h-3 w-3" /> {t("profile.heroBadge")}
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-7xl">
              {performer.stage_name}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {performer.tagline[lang]}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm sm:gap-4">
              <div className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-primary">
                <Star className="h-3.5 w-3.5 fill-primary" />
                <span className="font-semibold">{performer.rating.toFixed(2)}</span>
                <span className="text-primary/70">({performer.reviews_count})</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {performer.city[lang]}
              </div>
              <div className="text-muted-foreground">
                {t("catalog.from")}{" "}
                <span className="font-semibold text-foreground">
                  ${formatPrice(performer.price_from)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-[2fr_1fr] md:px-8">
        {/* Left: about + availability + reviews */}
        <div className="space-y-12">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {t("profile.about")}
            </h2>
            <div className="gold-divider mt-3" />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {performer.description[lang]}
            </p>
          </div>

          {/* What's included */}
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {t("profile.includes.title")}
            </h2>
            <div className="gold-divider mt-3" />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {includes.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground/85">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {t("avail.title")}
            </h2>
            <div className="gold-divider mt-3" />
            <p className="mt-3 text-sm text-muted-foreground">{t("avail.subtitle")}</p>
            <div className="card-luxe mt-6 rounded-2xl p-5 md:p-6">
              <AvailabilityCalendar
                performerId={performer.id}
                value={pickedDate}
                slot={pickedSlot}
                onChange={(d, s) => {
                  setPickedDate(d);
                  setPickedSlot(s);
                }}
              />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {pickedDate ? (
                    <>
                      <span className="font-medium text-foreground">
                        {new Date(pickedDate).toLocaleDateString(
                          lang === "ru" ? "ru-RU" : "en-US",
                          { day: "2-digit", month: "long" },
                        )}
                      </span>
                      {pickedSlot && (
                        <span className="ml-2 text-primary">· {pickedSlot}</span>
                      )}
                    </>
                  ) : (
                    t("avail.pickDate")
                  )}
                </div>
                <Button
                  variant="luxe"
                  disabled={!pickedDate}
                  onClick={() => setBookingOpen(true)}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {t("avail.bookSelected")}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {t("profile.reviews")}
            </h2>
            <div className="gold-divider mt-3" />
            <div className="mt-6 space-y-4">
              {/* Real DB reviews first */}
              {dbReviews.map((r) => (
                <div key={r.id} className="card-luxe rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[image:var(--gradient-gold)] text-sm font-semibold text-primary-foreground">
                        {(r.author_name ?? "G").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {r.author_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString(
                            lang === "ru" ? "ru-RU" : "en-US",
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-primary">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-primary" />
                      ))}
                    </div>
                  </div>
                  {r.text && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {r.text}
                    </p>
                  )}
                </div>
              ))}

              {/* Mock reviews shown only when no real ones (e.g., demo performers) */}
              {dbReviews.length === 0 &&
                mockReviewsForPerformer.map((r) => (
                  <div key={r.id} className="card-luxe rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-[image:var(--gradient-gold)] text-sm font-semibold text-primary-foreground">
                          {r.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {r.author}
                          </div>
                          <div className="text-xs text-muted-foreground">{r.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-primary">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {r.text[lang]}
                    </p>
                  </div>
                ))}

              {dbReviews.length === 0 && mockReviewsForPerformer.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  —
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: booking sidebar */}
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="card-luxe rounded-2xl p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("catalog.from")}
            </div>
            <div className="mt-1 font-display text-4xl font-semibold text-gradient-gold">
              ${formatPrice(performer.price_from)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              USD · {performer.city[lang]}
            </div>

            <div className="mt-6 space-y-2">
              <BookingDialog
                performerId={performer.id}
                performerName={performer.stage_name}
                initialDate={pickedDate}
                initialSlot={pickedSlot}
                open={bookingOpen}
                onOpenChange={setBookingOpen}
                renderTrigger={false}
              />
              <Button
                variant="luxe"
                size="lg"
                className="w-full"
                onClick={() => setBookingOpen(true)}
              >
                <CalendarIcon className="h-4 w-4" />
                {t("profile.book")}
              </Button>
              <Button variant="outlineGold" size="lg" className="w-full">
                <MessageCircle className="h-4 w-4" />
                {t("profile.message")}
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/40 pt-5 text-xs">
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {t("profile.responseTime")}
                </div>
                <div className="mt-1 font-medium text-foreground">
                  {t("profile.responseValue")}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {t("profile.completed")}
                </div>
                <div className="mt-1 font-medium text-foreground">
                  {completedCount ?? performer.reviews_count}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-border/40 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                {t("catalog.verified")} EPBMS
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/50 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("catalog.from")}
            </div>
            <div className="font-display text-xl font-semibold text-gradient-gold">
              ${formatPrice(performer.price_from)}
            </div>
          </div>
          <Button
            variant="luxe"
            size="lg"
            className="flex-1"
            onClick={() => setBookingOpen(true)}
          >
            <CalendarIcon className="h-4 w-4" />
            {t("profile.book")}
          </Button>
        </div>
      </div>
      {/* Spacer so sticky CTA doesn't cover content on mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
