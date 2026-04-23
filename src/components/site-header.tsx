import { Link, useNavigate } from "@tanstack/react-router";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleLang = () => setLang(lang === "ru" ? "en" : ("ru" as Lang));

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 surface-glass">
      <div className="container mx-auto flex h-18 items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-gold)] text-primary-foreground shadow-[var(--shadow-gold)] transition-transform group-hover:scale-105">
            <Sparkles className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-wide text-gradient-gold">
              EPBMS
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Elite Booking
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            {t("nav.home")}
          </Link>
          <Link
            to="/catalog"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            {t("nav.catalog")}
          </Link>
          <Link
            to="/how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            {t("nav.howItWorks")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="rounded-md border border-border/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            aria-label="Toggle language"
          >
            {lang === "ru" ? "RU · EN" : "EN · RU"}
          </button>

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav.signout")}</span>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">{t("nav.signin")}</Link>
              </Button>
              <Button asChild variant="luxe" size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("nav.signup")}
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
