import { useI18n } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-border/40">
      <div className="container mx-auto px-4 py-10 md:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-[image:var(--gradient-gold)] text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-sm font-semibold text-gradient-gold">EPBMS</div>
              <div className="text-xs text-muted-foreground">{t("footer.tagline")}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            © {year} EPBMS. {t("footer.rights")}.
          </div>
        </div>
      </div>
    </footer>
  );
}
