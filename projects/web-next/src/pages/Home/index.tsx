import { useState, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAppNavigate } from "@/router/navigation";
import { searchApps, getAppsByCategory, getFeaturedApps } from "@/data/apps";
import type { PWAApp, Category } from "@/data/apps";
import { useInfiniteApps } from "@/hooks/useInfiniteApps";
import { VirtualAppGrid } from "@/components/VirtualAppGrid";
import styles from "./index.module.scss";

const isUrl = (str: string) => str.startsWith("http://") || str.startsWith("https://");

// ── Star Rating Component ──────────────────────────
const StarRating = ({ rating }: { rating: number }) => {
  if (!rating) return null;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <span className={styles.stars}>
      {"★".repeat(full)}
      {hasHalf && "½"}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </span>
  );
};

// ── App Icon (supports both URL images and emoji) ──
const AppIcon = ({ icon, color, name }: { icon: string; color: string; name: string }) => {
  const glyph = isUrl(icon) ? name.charAt(0).toUpperCase() : icon || name.charAt(0).toUpperCase();

  return (
    <div className={styles.appIcon} style={{ background: color }}>
      <span>{glyph}</span>
    </div>
  );
};

// ── App Card Component ─────────────────────────────
const AppCard = ({ app, allCategories }: { app: PWAApp; allCategories: Category[] }) => {
  const category = allCategories.find((c) => c.id === app.category);

  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer" className={styles.appCard}>
      <AppIcon icon={app.icon} color={app.color} name={app.name} />
      <div className={styles.appInfo}>
        <h3 className={styles.appName}>{app.name}</h3>
        {app.developer && <p className={styles.appDeveloper}>{app.developer}</p>}
        <p className={styles.appDesc}>{app.description}</p>
        <div className={styles.appMeta}>
          {category && (
            <span className={styles.categoryTag}>
              {category.icon} {category.name}
            </span>
          )}
          <StarRating rating={app.rating} />
        </div>
      </div>
    </a>
  );
};

// ── Featured App Card (larger) ─────────────────────
const FeaturedCard = ({ app, allCategories }: { app: PWAApp; allCategories: Category[] }) => {
  const category = allCategories.find((c) => c.id === app.category);

  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer" className={styles.featuredCard}>
      <div
        className={styles.featuredBg}
        style={{
          background: `linear-gradient(135deg, ${app.color}18, ${app.color}08)`,
        }}
      />
      <div className={styles.featuredIcon} style={{ background: app.color }}>
        <span>
          {isUrl(app.icon) ? app.name.charAt(0).toUpperCase() : app.icon || app.name.charAt(0)}
        </span>
      </div>
      <div className={styles.featuredInfo}>
        <div className={styles.featuredTop}>
          {category && (
            <span className={styles.featuredTag}>
              {category.icon} {category.name}
            </span>
          )}
          <StarRating rating={app.rating} />
        </div>
        <h3 className={styles.featuredName}>{app.name}</h3>
        <p className={styles.featuredDesc}>{app.description}</p>
        {app.developer && <span className={styles.featuredDev}>{app.developer}</span>}
      </div>
    </a>
  );
};

// ── Category Card Component ────────────────────────
const CategoryCard = ({
  category,
  isActive,
  onClick,
}: {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      className={`${styles.categoryCard} ${isActive ? styles.categoryActive : ""}`}
      onClick={onClick}
      aria-pressed={isActive}
      style={
        isActive ? { background: category.gradient, color: "#fff", borderColor: "transparent" } : {}
      }
    >
      <span className={styles.categoryEmoji}>{category.icon}</span>
      <span className={styles.categoryName}>{category.name}</span>
      <span className={styles.categoryCount}>{category.count}</span>
    </button>
  );
};

// ── Main Home Page ─────────────────────────────────
const Home = () => {
  const navigate = useAppNavigate();
  const { apps, categories, loading, loadingMore, hasMore, error, loadMore } = useInfiniteApps();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const featured = useMemo(() => getFeaturedApps(apps), [apps]);

  const filteredApps = useMemo(() => {
    if (searchQuery.trim()) {
      return searchApps(apps, searchQuery);
    }
    if (activeCategory) {
      return getAppsByCategory(apps, activeCategory);
    }
    return apps;
  }, [apps, searchQuery, activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
    setSearchQuery("");
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setActiveCategory(null);
    }
  };

  const popularTags = ["Telegram", "Notion", "Spotify", "Wordle", "Duolingo"];

  usePageMeta({
    title: "PWALand — Discover Progressive Web Apps",
    description:
      "PWALand is a curated Progressive Web App directory for discovering installable, offline-capable web apps across productivity, social, games, education, finance, and tools.",
    canonical: "https://pwaland.brandonxiang.top/",
    keywords:
      "Progressive Web Apps, PWA directory, installable web apps, offline web apps, web app directory",
    openGraph: {
      title: "PWALand — Discover Progressive Web Apps",
      description:
        "Discover installable, offline-capable Progressive Web Apps in a curated directory.",
      url: "https://pwaland.brandonxiang.top/",
      image: "https://pwaland.brandonxiang.top/og-image.jpg",
    },
  });

  return (
    <div className={styles.home}>
      {/* ── Hero Section ─────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Open PWA Directory
          </div>
          <h1 className={styles.heroTitle}>
            Discover the Best
            <br />
            <span className={styles.heroAccent}>Progressive Web Apps</span>
          </h1>
          <p className={styles.heroSub}>
            Explore a curated collection of modern web applications that work offline, load
            instantly, and feel native on any device.
          </p>

          {/* Search Bar */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon} aria-hidden="true">
                ⌕
              </span>
              <input
                type="text"
                aria-label="Search PWA apps"
                placeholder="Search PWA apps..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  className={styles.searchClear}
                  onClick={() => handleSearch("")}
                  aria-label="Clear search"
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>

            {/* Popular Tags */}
            <div className={styles.tags}>
              <span className={styles.tagsLabel}>Popular:</span>
              {popularTags.map((tag) => (
                <button key={tag} className={styles.tag} onClick={() => handleSearch(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{apps.length}+</span>
              <span className={styles.statLabel}>PWA Apps</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{categories.length}</span>
              <span className={styles.statLabel}>Categories</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>100%</span>
              <span className={styles.statLabel}>Free & Open</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Loading / Error States ────────────────── */}
      {loading && apps.length === 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.loadingState}>
              <span className={styles.loader} aria-hidden="true" />
              <p>Loading apps...</p>
            </div>
          </div>
        </section>
      )}

      {error && apps.length === 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>⚠️</span>
              <h2 className={styles.emptyTitle}>Failed to load apps</h2>
              <p className={styles.emptyDesc}>{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Section ─────────────────────── */}
      {!searchQuery && !activeCategory && featured.length > 0 && (
        <section id="featured" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Featured Apps</h2>
              <p className={styles.sectionSub}>
                Hand-picked PWAs that showcase the best of the modern web
              </p>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((app) => (
                <FeaturedCard key={app.id} app={app} allCategories={categories} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Categories Section ───────────────────── */}
      {categories.length > 0 && (
        <section id="categories" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {searchQuery ? "Search Results" : "Browse by Category"}
              </h2>
              <p className={styles.sectionSub}>
                {searchQuery
                  ? `${filteredApps.length} app${filteredApps.length !== 1 ? "s" : ""} found for "${searchQuery}"`
                  : "Find the perfect app for your needs"}
              </p>
            </div>

            {!searchQuery && (
              <div className={styles.categoryRow}>
                {categories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isActive={activeCategory === cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── App Grid Section ─────────────────────── */}
      {(apps.length > 0 || loadingMore) && (
        <section id="apps" className={styles.section}>
          <div className={styles.container}>
            <VirtualAppGrid
              apps={filteredApps}
              categories={categories}
              hasMore={!searchQuery && !activeCategory ? hasMore : false}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
              renderCard={(app, cats) => <AppCard key={app.id} app={app} allCategories={cats} />}
            />
          </div>
        </section>
      )}

      {/* ── CTA Section ──────────────────────────── */}
      {!searchQuery && !activeCategory && (
        <section className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Submit Your PWA</h2>
              <p className={styles.ctaDesc}>
                Built an amazing Progressive Web App? Submit it to our directory and get discovered
                by thousands of users.
              </p>
              <button className={styles.ctaBtn} onClick={() => navigate("/submit")}>
                Submit Your PWA
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span className={styles.footerLogoIcon}>◆</span>
                <span className={styles.footerLogoText}>PWALand</span>
              </div>
              <p className={styles.footerDesc}>
                A curated directory of the best Progressive Web Apps. Discover, explore, and install
                modern web applications.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <h2 className={styles.footerColTitle}>Directory</h2>
                <a href="/">All Apps</a>
                <a href="/#featured">Featured</a>
                <a href="/#categories">Categories</a>
                <a href="/#apps">Browse Apps</a>
              </div>
              <div className={styles.footerCol}>
                <h2 className={styles.footerColTitle}>Resources</h2>
                <a href="https://web.dev/learn/pwa" target="_blank" rel="noopener noreferrer">
                  What is PWA?
                </a>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Developer Guide
                </a>
                <a href="/submit">Submit an App</a>
                <a href="/llms.txt">AI Summary</a>
              </div>
              <div className={styles.footerCol}>
                <h2 className={styles.footerColTitle}>Community</h2>
                <a
                  href="https://github.com/brandonxiang/pwaland"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a href="/submit">Submit a PWA</a>
                <a
                  href="https://web.dev/explore/progressive-web-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PWA resources
                </a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} PWALand. Open source & community driven.</span>
            <div className={styles.footerBottomLinks}>
              <a href="/robots.txt">Robots</a>
              <a href="/sitemap.xml">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
