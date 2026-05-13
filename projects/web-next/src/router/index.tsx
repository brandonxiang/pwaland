import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Home from "@/pages/Home";
import NotFound from "@/pages/404";
import { PageLoading } from "@/components/PageLoading";
import { ContentLayout } from "@/layouts/BaseLayout";
import { NavigationContext } from "./navigation";

const Submit = lazy(() => import("@/pages/Submit"));

function normalizePath(pathname: string): string {
  if (pathname === "") {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export const AppRouter = () => {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const nextPath = normalizePath(path);
    if (nextPath === normalizePath(window.location.pathname)) {
      return;
    }

    window.history.pushState(null, "", nextPath);
    setPathname(nextPath);
    window.scrollTo({ top: 0 });
  }, []);

  const contextValue = useMemo(() => ({ pathname, navigate }), [navigate, pathname]);
  const Page = pathname === "/" ? Home : pathname === "/submit" ? Submit : NotFound;

  return (
    <NavigationContext.Provider value={contextValue}>
      <ContentLayout>
        <Suspense fallback={<PageLoading />}>
          <Page />
        </Suspense>
      </ContentLayout>
    </NavigationContext.Provider>
  );
};
