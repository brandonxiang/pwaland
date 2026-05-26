import { useEffect } from "react";
import { useAppLocation } from "@/router/navigation";

const QUICKLINK_IDLE_DELAY_MS = 3000;

function shouldEnableQuicklink(): boolean {
  return import.meta.env.VITE_ENABLE_QUICKLINK !== "false";
}

export function useQuicklink(): void {
  const { pathname } = useAppLocation();

  useEffect(() => {
    if (!shouldEnableQuicklink()) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      const { listen } = await import("quicklink");

      if (cancelled) {
        return;
      }

      cleanup = listen({
        origins: [window.location.origin],
        limit: 2,
        ignores: [/\/api\//, /\/submit(?:\/|$)/, (uri: string) => uri.includes("#")],
      });
    }, QUICKLINK_IDLE_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      cleanup?.();
    };
  }, [pathname]);
}
