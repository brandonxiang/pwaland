import { useEffect } from "react";

const ANALYTICS_IDLE_DELAY_MS = 3000;

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function shouldEnableAnalytics(): boolean {
  const flag = import.meta.env.VITE_ENABLE_ANALYTICS;

  if (flag === "true") {
    return true;
  }

  if (flag === "false") {
    return false;
  }

  return import.meta.env.PROD && !isLocalHost(window.location.hostname);
}

export function useAnalytics(): void {
  useEffect(() => {
    if (!shouldEnableAnalytics()) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const { inject } = await import("@vercel/analytics");
      inject({ mode: "production" });
    }, ANALYTICS_IDLE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);
}
