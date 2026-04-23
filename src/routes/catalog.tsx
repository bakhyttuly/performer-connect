import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { PerformerCard } from "@/components/performer-card";
import { mockPerformers, type CategoryKey } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — EPBMS" },
      { name: "description", content: "Browse verified premium performers for events." },
      { property: "og:title", content: "Catalog — EPBMS" },
      { property: "og:description", content: "Verified premium performers for events." },
    ],
  }),
  component: CatalogPage,
});

const categories: ("all" | CategoryKey)[] = ["all", "singer", "dj", "band", "host", "magic", "show"];

function CatalogPage() {
  const { t } = useI18n();
  const [active, setActive] = useState<"all" | CategoryKey>("all");

  const filtered = active === "all" ? mockPerformers : mockPerformers.filter((p) => p.category === active);

  return (
    <div className="container mx-auto px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">EPBMS · Catalog</div>
        <h1 className="mt-3 font-display text-5xl font-semibold text-foreground md:text-6xl">
          {t("catalog.title")}
        </h1>
        <p className="mt-4 text-muted-foreground">{t("catalog.subtitle")}</p>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-all",
              active === c
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {t(`cat.${c}`)}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <PerformerCard key={p.id} performer={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-20 text-center text-muted-foreground">{t("catalog.empty")}</div>
      )}
    </div>
  );
}
