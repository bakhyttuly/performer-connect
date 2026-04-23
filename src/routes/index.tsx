import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles, ShieldCheck, MessageCircle, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { PerformerCard } from "@/components/performer-card";
import { mockPerformers } from "@/lib/mock-data";
import heroImg from "@/assets/hero-stage.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();
  const featured = mockPerformers.slice(0, 6);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt=""
            width={1920}
            height={1280}
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>

        <div className="container mx-auto px-4 py-24 md:px-8 md:py-36">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary animate-fade-up">
              <Sparkles className="h-3 w-3" />
              {t("hero.eyebrow")}
            </div>

            <h1
              className="mt-8 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              {t("hero.title.1")}{" "}
              <span className="text-gradient-gold italic">{t("hero.title.gold")}</span>
              <br />
              <span className="text-foreground/90">{t("hero.title.3")}</span>
            </h1>

            <p
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              {t("hero.subtitle")}
            </p>

            {/* Search */}
            <div
              className="mx-auto mt-10 max-w-xl animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <div className="surface-glass flex items-center gap-2 rounded-full p-2 pl-5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("hero.search.placeholder")}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <Button asChild variant="luxe" size="sm" className="rounded-full">
                  <Link to="/catalog">{t("hero.cta.browse")}</Link>
                </Button>
              </div>
            </div>

            <div
              className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up"
              style={{ animationDelay: "320ms" }}
            >
              <Button asChild variant="outlineGold" size="lg">
                <Link to="/catalog">
                  {t("hero.cta.browse")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("hero.cta.become")}
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div
              className="mt-20 grid grid-cols-2 gap-8 border-t border-border/40 pt-10 md:grid-cols-4 animate-fade-up"
              style={{ animationDelay: "400ms" }}
            >
              {[
                { v: "2 400+", k: "stats.performers" },
                { v: "18 600", k: "stats.events" },
                { v: "92", k: "stats.cities" },
                { v: "4.94", k: "stats.rating" },
              ].map((s) => (
                <div key={s.k} className="text-center">
                  <div className="font-display text-3xl font-semibold text-gradient-gold md:text-4xl">
                    {s.v}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {t(s.k)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PERFORMERS */}
      <section className="container mx-auto px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">
              {t("catalog.title")}
            </div>
            <h2 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
              {t("catalog.subtitle")}
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/catalog">
              {t("catalog.viewAll")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <PerformerCard key={p.id} performer={p} index={i} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">EPBMS</div>
          <h2 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
            {t("how.title")}
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Search, t: "how.s1.t", d: "how.s1.d", n: "01" },
            { icon: MessageCircle, t: "how.s2.t", d: "how.s2.d", n: "02" },
            { icon: Calendar, t: "how.s3.t", d: "how.s3.d", n: "03" },
          ].map((step, i) => (
            <div
              key={step.n}
              className="card-luxe rounded-2xl p-8 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-3xl text-muted-foreground/40">{step.n}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                {t(step.t)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(step.d)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BAND */}
      <section className="container mx-auto px-4 py-12 md:px-8">
        <div className="surface-glass flex flex-col items-center justify-between gap-6 rounded-2xl p-8 md:flex-row md:p-12">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                {t("brand.tagline")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("hero.subtitle")}</p>
            </div>
          </div>
          <Button asChild variant="luxe" size="lg">
            <Link to="/catalog">
              {t("hero.cta.browse")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
