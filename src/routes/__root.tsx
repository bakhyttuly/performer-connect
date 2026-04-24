import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-semibold text-gradient-gold">404</h1>
        <h2 className="mt-4 font-display text-2xl text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[image:var(--gradient-gold)] px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-105"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EPBMS — Elite Performer Booking" },
      {
        name: "description",
        content:
          "EPBMS — премиум платформа для бронирования верифицированных артистов на ивенты. Музыканты, ведущие, шоу.",
      },
      { name: "author", content: "EPBMS" },
      { property: "og:title", content: "EPBMS — Elite Performer Booking" },
      {
        property: "og:description",
        content: "Premium platform to book verified artists for unforgettable events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "EPBMS — Elite Performer Booking" },
      { name: "twitter:description", content: "EPBMS is a premium web platform for finding and booking service providers, featuring verification, chat, and reviews." },
      { name: "description", content: "EPBMS is a premium web platform for finding and booking service providers, featuring verification, chat, and reviews." },
      { property: "og:description", content: "EPBMS is a premium web platform for finding and booking service providers, featuring verification, chat, and reviews." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3cd3b215-9d6e-4532-a505-0bd64d2df76e/id-preview-f99b00eb--d8f89094-8e46-425b-9c0f-4e236cf96d61.lovable.app-1777001646775.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3cd3b215-9d6e-4532-a505-0bd64d2df76e/id-preview-f99b00eb--d8f89094-8e46-425b-9c0f-4e236cf96d61.lovable.app-1777001646775.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <I18nProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster />
      </AuthProvider>
    </I18nProvider>
  );
}
