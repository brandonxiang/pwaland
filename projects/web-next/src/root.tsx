import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { ThemeProvider } from "@/providers/ThemeProvider";
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
      <ContentLayout>
        <Outlet />
      </ContentLayout>
    </ThemeProvider>
  );
}
