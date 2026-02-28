import { describe, it, expect } from "vitest"
import {
  extractManifestLink,
  extractMetaDescription,
  detectServiceWorker,
  findBestIcon,
  resolveUrl,
} from "./pwa-checker"

describe("extractManifestLink", () => {
  it("extracts href when rel comes before href", () => {
    const html = '<link rel="manifest" href="/manifest.json">'
    expect(extractManifestLink(html)).toBe("/manifest.json")
  })

  it("extracts href when href comes before rel", () => {
    const html = '<link href="/app.webmanifest" rel="manifest">'
    expect(extractManifestLink(html)).toBe("/app.webmanifest")
  })

  it("returns null when no manifest link exists", () => {
    const html = "<html><head><title>Test</title></head></html>"
    expect(extractManifestLink(html)).toBeNull()
  })

  it("handles self-closing tag", () => {
    const html = '<link rel="manifest" href="/m.json" />'
    expect(extractManifestLink(html)).toBe("/m.json")
  })
})

describe("extractMetaDescription", () => {
  it("extracts name=description meta tag", () => {
    const html = '<meta name="description" content="A cool PWA">'
    expect(extractMetaDescription(html)).toBe("A cool PWA")
  })

  it("extracts og:description meta tag", () => {
    const html = '<meta property="og:description" content="OG desc">'
    expect(extractMetaDescription(html)).toBe("OG desc")
  })

  it("returns null when no description exists", () => {
    const html = "<html><head></head></html>"
    expect(extractMetaDescription(html)).toBeNull()
  })
})

describe("detectServiceWorker", () => {
  it("detects navigator.serviceWorker.register pattern", () => {
    const html = "<script>navigator.serviceWorker.register('/sw.js')</script>"
    const result = detectServiceWorker(html)
    expect(result.found).toBe(true)
  })

  it("detects workbox pattern", () => {
    const html = "<script src='workbox-sw.js'></script>"
    const result = detectServiceWorker(html)
    expect(result.found).toBe(true)
  })

  it("returns found=false when no SW patterns", () => {
    const html = "<html><body>Hello</body></html>"
    const result = detectServiceWorker(html)
    expect(result.found).toBe(false)
  })
})

describe("resolveUrl", () => {
  it("returns absolute URL unchanged", () => {
    expect(resolveUrl("https://example.com/icon.png", "https://base.com")).toBe(
      "https://example.com/icon.png",
    )
  })

  it("resolves relative URL against base", () => {
    expect(resolveUrl("/icons/icon.png", "https://example.com")).toBe(
      "https://example.com/icons/icon.png",
    )
  })

  it("returns original URL on parse failure", () => {
    expect(resolveUrl("://broken", "://also-broken")).toBe("://broken")
  })
})

describe("findBestIcon", () => {
  const baseUrl = "https://example.com"

  it("prefers 512x512 icon", () => {
    const icons = [
      { src: "/icon-192.png", sizes: "192x192" },
      { src: "/icon-512.png", sizes: "512x512" },
    ]
    expect(findBestIcon(icons, baseUrl)).toBe("https://example.com/icon-512.png")
  })

  it("falls back to first icon with src if no preferred size", () => {
    const icons = [{ src: "/icon-any.png", sizes: "48x48" }]
    expect(findBestIcon(icons, baseUrl)).toBe("https://example.com/icon-any.png")
  })

  it("returns null for empty array", () => {
    expect(findBestIcon([], baseUrl)).toBeNull()
  })

  it("returns null for undefined", () => {
    expect(findBestIcon(undefined as any, baseUrl)).toBeNull()
  })
})
