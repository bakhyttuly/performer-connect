import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Star, MapPin, BadgeCheck, MessageCircle, Calendar, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { mockPerformers, mockReviews, formatPrice } from "@/lib/mock-data";
import { PerformerCover } from "@/components/performer-cover";

export const Route = createFileRoute("/performer/$id")({
  loader: ({ params }) => {
    const performer = mockPerformers.find((p) => p.id === params.id);
    if (!performer) throw notFound();
    return { performer };
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
  const { performer } = Route.useLoaderData();
  const reviews = mockReviews.filter((r) => r.performerId === performer.id);

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
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              {t(`cat.${performer.category}`)}
              {performer.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-primary">
                  <BadgeCheck className="h-3 w-3" /> {t("catalog.verified")}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-foreground md:text-7xl">
              {performer.stage_name}
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              {performer.tagline[lang]}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
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
        {/* Left: about + reviews */}
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

          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {t("profile.reviews")}
            </h2>
            <div className="gold-divider mt-3" />
            <div className="mt-6 space-y-4">
              {reviews.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                  —
                </div>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="card-luxe rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[image:var(--gradient-gold)] text-sm font-semibold text-primary-foreground">
                        {r.author.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{r.author}</div>
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
            <div className="mt-1 text-xs text-muted-foreground">USD · {performer.city[lang]}</div>

            <div className="mt-6 space-y-2">
              <Button variant="luxe" size="lg" className="w-full">
                <Calendar className="h-4 w-4" />
                {t("profile.book")}
              </Button>
              <Button variant="outlineGold" size="lg" className="w-full">
                <MessageCircle className="h-4 w-4" />
                {t("profile.message")}
              </Button>
            </div>

            <div className="mt-6 border-t border-border/40 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                {t("catalog.verified")} EPBMS
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
