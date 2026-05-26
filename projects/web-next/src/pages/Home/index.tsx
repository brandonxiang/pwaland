import { useDeferredValue, useState, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAppNavigate } from "@/router/navigation";
import { getFeaturedApps, normalizeCategoryId } from "@/data/apps";
import type { PWAApp, Category } from "@/data/apps";
import { useInfiniteApps } from "@/hooks/useInfiniteApps";
import { useI18n } from "@/providers/I18nProvider";
import { VirtualAppGrid } from "@/components/VirtualAppGrid";
import styles from "./index.module.scss";

const isUrl = (str: string) => str.startsWith("http://") || str.startsWith("https://");

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

const AppIcon = ({ icon, color, name }: { icon: string; color: string; name: string }) => {
  const glyph = isUrl(icon) ? name.charAt(0).toUpperCase() : icon || name.charAt(0).toUpperCase();

  return (
    <div className={styles.appIcon} style={{ background: color }}>
      <span>{glyph}</span>
    </div>
  );
};

const AppCard = ({ app, allCategories }: { app: PWAApp; allCategories: Category[] }) => {
  const { categoryName } = useI18n();
  const category = allCategories.find((c) => c.id === normalizeCategoryId(app.category));

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
              {category.icon} {categoryName(category.name)}
            </span>
          )}
          <StarRating rating={app.rating} />
        </div>
      </div>
    </a>
  );
};

const FeaturedCard = ({ app, allCategories }: { app: PWAApp; allCategories: Category[] }) => {
  const { categoryName } = useI18n();
  const category = allCategories.find((c) => c.id === normalizeCategoryId(app.category));

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
              {category.icon} {categoryName(category.name)}
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

const Home = () => {
  const navigate = useAppNavigate();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const { apps, categories, loading, loadingMore, hasMore, error, loadMore } =
    useInfiniteApps(deferredSearchQuery);

  const featured = useMemo(() => getFeaturedApps(apps), [apps]);

  const popularTags = ["Telegram", "Notion", "Spotify", "Wordle", "Duolingo"];

  usePageMeta({
    title: t("home.metaTitle"),
    description: t("home.metaDescription"),
    canonical: "https://pwaland.brandonxiang.top/",
    keywords:
      "Progressive Web Apps, PWA directory, installable web apps, offline web apps, web app directory",
    openGraph: {
      title: t("home.metaTitle"),
      description: t("home.metaDescription"),
      url: "https://pwaland.brandonxiang.top/",
      image: "https://pwaland.brandonxiang.top/og-image.jpg",
    },
  });

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            {t("home.badge")}
          </div>
          <h1 className={styles.heroTitle}>
            {t("home.titleLine1")}
            <br />
            <span className={styles.heroAccent}>{t("home.titleLine2")}</span>
          </h1>
          <p className={styles.heroSub}>{t("home.subtitle")}</p>

          <div className={styles.searchWrapper}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon} aria-hidden="true">
                ⌕
              </span>
              <input
                type="text"
                aria-label={t("home.searchLabel")}
                placeholder={t("home.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  className={styles.searchClear}
                  onClick={() => setSearchQuery("")}
                  aria-label={t("home.clearSearch")}
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>

            <div className={styles.tags}>
              <span className={styles.tagsLabel}>{t("home.popular")}</span>
              {popularTags.map((tag) => (
                <button key={tag} className={styles.tag} onClick={() => setSearchQuery(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{apps.length}+</span>
              <span className={styles.statLabel}>{t("home.apps")}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{categories.length}</span>
              <span className={styles.statLabel}>{t("home.categories")}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>100%</span>
              <span className={styles.statLabel}>{t("home.freeOpen")}</span>
            </div>
          </div>
        </div>
      </section>

      {loading && apps.length === 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.loadingState}>
              <span className={styles.loader} aria-hidden="true" />
              <p>{t("home.loading")}</p>
            </div>
          </div>
        </section>
      )}

      {error && apps.length === 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>⚠️</span>
              <h2 className={styles.emptyTitle}>{t("home.loadFailed")}</h2>
              <p className={styles.emptyDesc}>{error}</p>
            </div>
          </div>
        </section>
      )}

      {!deferredSearchQuery && featured.length > 0 && (
        <section id="featured" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t("home.featuredTitle")}</h2>
              <p className={styles.sectionSub}>{t("home.featuredSubtitle")}</p>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((app) => (
                <FeaturedCard key={app.id} app={app} allCategories={categories} />
              ))}
            </div>
          </div>
        </section>
      )}

      {(apps.length > 0 || loadingMore) && (
        <section id="apps" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {deferredSearchQuery ? t("home.searchResults") : t("home.allApps")}
              </h2>
              <p className={styles.sectionSub}>
                {deferredSearchQuery
                  ? t("home.searchCount", {
                      count: apps.length,
                      plural: apps.length === 1 ? "" : "s",
                      query: deferredSearchQuery,
                    })
                  : t("home.allAppsSubtitle")}
              </p>
            </div>
            <VirtualAppGrid
              apps={apps}
              categories={categories}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
              renderCard={(app, cats) => <AppCard key={app.id} app={app} allCategories={cats} />}
            />
          </div>
        </section>
      )}

      {!deferredSearchQuery && (
        <section className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>{t("home.submitTitle")}</h2>
              <p className={styles.ctaDesc}>{t("home.submitDesc")}</p>
              <button className={styles.ctaBtn} onClick={() => navigate("/submit")}>
                {t("home.submitCta")}
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span className={styles.footerLogoIcon}>◆</span>
                <span className={styles.footerLogoText}>PWALand</span>
              </div>
              <p className={styles.footerDesc}>{t("home.footerDesc")}</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <h2 className={styles.footerColTitle}>{t("home.footerDirectory")}</h2>
                <a href="/">{t("home.allAppsLink")}</a>
                <a href="/#featured">{t("home.featuredLink")}</a>
                <a href="/categories">{t("home.categoriesLink")}</a>
                <a href="/#apps">{t("home.browseAppsLink")}</a>
              </div>
              <div className={styles.footerCol}>
                <h2 className={styles.footerColTitle}>{t("home.footerResources")}</h2>
                <a href="https://web.dev/learn/pwa" target="_blank" rel="noopener noreferrer">
                  {t("home.whatIsPwa")}
                </a>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("home.developerGuide")}
                </a>
                <a href="/submit">{t("home.submitApp")}</a>
                <a href="/llms.txt">{t("home.aiSummary")}</a>
              </div>
              <div className={styles.footerCol}>
                <h2 className={styles.footerColTitle}>{t("home.footerCommunity")}</h2>
                <a
                  href="https://github.com/brandonxiang/pwaland"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a href="/submit">{t("home.submitPwa")}</a>
                <a
                  href="https://web.dev/explore/progressive-web-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("home.pwaResources")}
                </a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>
              © {new Date().getFullYear()} {t("home.copyright")}
            </span>
            <div className={styles.footerBottomLinks}>
              <a href="/robots.txt">{t("home.robots")}</a>
              <a href="/sitemap.xml">{t("home.sitemap")}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
