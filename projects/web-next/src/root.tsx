import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ContentLayout } from "@/layouts/BaseLayout";
import "./index.scss";
import "./App.scss";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useAnalytics();

  return (
    <ThemeProvider>
      <I18nProvider>
        <ContentLayout>
          <Outlet />
        </ContentLayout>
      </I18nProvider>
    </ThemeProvider>
  );
}
