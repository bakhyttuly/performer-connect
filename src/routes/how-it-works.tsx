import { createFileRoute } from "@tanstack/react-router";
import { Search, MessageCircle, Calendar, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — EPBMS" },
      { name: "description", content: "How to book a verified premium performer on EPBMS." },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { icon: Search, t: "how.s1.t", d: "how.s1.d", n: "01" },
    { icon: MessageCircle, t: "how.s2.t", d: "how.s2.d", n: "02" },
    { icon: Calendar, t: "how.s3.t", d: "how.s3.d", n: "03" },
    { icon: ShieldCheck, t: "catalog.verified", d: "footer.tagline", n: "04" },
  ];

  return (
    <div className="container mx-auto px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">EPBMS</div>
        <h1 className="mt-3 font-display text-5xl font-semibold text-foreground md:text-6xl">
          {t("how.title")}
        </h1>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.n} className="card-luxe rounded-2xl p-8 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="font-display text-3xl text-muted-foreground/40">{s.n}</span>
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-foreground">{t(s.t)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.d)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
