import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
  canonical?: string;
  robots?: string;
  keywords?: string;
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
  };
}

const DEFAULT_ROBOTS = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";

function upsertMeta(attribute: "name" | "property", key: string, content: string): void {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertCanonical(href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = href;
}

function removeCanonical(): void {
  document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.remove();
}

export function usePageMeta({
  title,
  description,
  canonical,
  robots,
  keywords,
  openGraph,
}: PageMeta): void {
  useEffect(() => {
    document.title = title;

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("name", "twitter:description", description);
    }

    upsertMeta("name", "robots", robots ?? DEFAULT_ROBOTS);

    if (keywords) {
      upsertMeta("name", "keywords", keywords);
    }

    if (openGraph?.title) {
      upsertMeta("property", "og:title", openGraph.title);
      upsertMeta("name", "twitter:title", openGraph.title);
    }

    if (openGraph?.description) {
      upsertMeta("property", "og:description", openGraph.description);
    }

    if (openGraph?.url) {
      upsertMeta("property", "og:url", openGraph.url);
      upsertMeta("name", "twitter:url", openGraph.url);
    }

    if (openGraph?.image) {
      upsertMeta("property", "og:image", openGraph.image);
      upsertMeta("name", "twitter:image", openGraph.image);
    }

    if (canonical) {
      upsertCanonical(canonical);
    } else {
      removeCanonical();
    }
  }, [
    canonical,
    description,
    keywords,
    openGraph?.description,
    openGraph?.image,
    openGraph?.title,
    openGraph?.url,
    robots,
    title,
  ]);
}
