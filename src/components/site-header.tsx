import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const { user, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleLang = () => setLang(lang === "ru" ? "en" : ("ru" as Lang));
  const isAdmin = hasRole("admin");

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 surface-glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 py-3 md:h-18 md:py-4 md:px-8">
        <Link to="/" className="group flex items-center gap-2.5" onClick={closeMobile}>
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
          {user && (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                to="/bookings"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {t("nav.bookings")}
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("nav.admin")}
            </Link>
          )}
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
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden gap-2 sm:inline-flex"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">{t("nav.dashboard")}</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
                className="hidden gap-2 sm:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.signout")}</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link to="/auth">{t("nav.signin")}</Link>
              </Button>
              <Button asChild variant="luxe" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("nav.signup")}
                </Link>
              </Button>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t("nav.close") : t("nav.menu")}
            className="grid h-9 w-9 place-items-center rounded-md border border-border/60 text-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-md transition-[max-height] duration-300 md:hidden",
          mobileOpen ? "max-h-[480px]" : "max-h-0",
        )}
      >
        <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
          {[
            { to: "/", key: "nav.home", exact: true },
            { to: "/catalog", key: "nav.catalog" },
            { to: "/how-it-works", key: "nav.howItWorks" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={closeMobile}
              activeProps={{ className: "text-foreground bg-primary/10" }}
              activeOptions={l.exact ? { exact: true } : undefined}
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              {t(l.key)}
            </Link>
          ))}
          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={closeMobile}
                activeProps={{ className: "text-foreground bg-primary/10" }}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                to="/bookings"
                onClick={closeMobile}
                activeProps={{ className: "text-foreground bg-primary/10" }}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                {t("nav.bookings")}
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={closeMobile}
              activeProps={{ className: "text-foreground bg-primary/10" }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              <ShieldCheck className="h-4 w-4" />
              {t("nav.admin")}
            </Link>
          )}

          <div className="mt-2 border-t border-border/40 pt-3">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  closeMobile();
                  await signOut();
                  navigate({ to: "/" });
                }}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t("nav.signout")}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth" onClick={closeMobile}>
                    {t("nav.signin")}
                  </Link>
                </Button>
                <Button asChild variant="luxe" size="sm">
                  <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    onClick={closeMobile}
                  >
                    {t("nav.signup")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
