import { Link } from "@tanstack/react-router";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { MockPerformer } from "@/lib/mock-data";

interface Props {
  performer: MockPerformer;
  index?: number;
}

export function PerformerCard({ performer, index = 0 }: Props) {
  const { t, lang } = useI18n();
  return (
    <Link
      to="/performer/$id"
      params={{ id: performer.id }}
      className="card-luxe group relative block overflow-hidden rounded-2xl animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={performer.cover}
          alt={performer.stage_name}
          loading="lazy"
          width={800}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {performer.verified && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary backdrop-blur-md">
            <BadgeCheck className="h-3 w-3" />
            {t("catalog.verified")}
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground/80 backdrop-blur-md">
          {t(`cat.${performer.category}`)}
        </div>
      </div>

      <div className="relative -mt-16 space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              {performer.stage_name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {performer.tagline[lang]}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            <Star className="h-3 w-3 fill-primary" />
            {performer.rating.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {performer.city[lang]}
          </div>
          <div className="text-muted-foreground">
            {t("catalog.from")}{" "}
            <span className="font-semibold text-foreground">
              ${performer.price_from.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
