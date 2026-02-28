import { useEffect } from 'react';
import { listen } from 'quicklink';
import { useLocation } from 'react-router';

/**
 * Initializes quicklink to prefetch in-viewport links on each route change.
 * Uses IntersectionObserver to detect visible <a> tags and prefetches them
 * during idle time, improving perceived navigation speed.
 */
export function useQuicklink() {
  const { pathname } = useLocation();

  useEffect(() => {
    const cleanup = listen({
      origins: [window.location.hostname],
      ignores: [
        /\/api\//,
        (uri: string) => uri.includes('#'),
      ],
    });

    return cleanup;
  }, [pathname]);
}
