import { useMemo, useState } from "react";
import type { Category, PWAApp } from "@/data/apps";
import { getAppsByCategory, normalizeCategoryId } from "@/data/apps";
import { useApps } from "@/hooks/useApps";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useI18n } from "@/providers/I18nProvider";
import { VirtualAppGrid } from "@/components/VirtualAppGrid";
import { AppIcon } from "@/components/AppIcon";
import styles from "./index.module.scss";

const DEFAULT_CATEGORY_ID = "entertainment";

const AppCard = ({ app, allCategories }: { app: PWAApp; allCategories: Category[] }) => {
  const { categoryName } = useI18n();
  const category = allCategories.find((c) => c.id === normalizeCategoryId(app.category));

  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer" className={styles.appCard}>
      <AppIcon icon={app.icon} color={app.color} name={app.name} />
      <div className={styles.appInfo}>
        <h3 className={styles.appName}>{app.name}</h3>
        <p className={styles.appDesc}>{app.description}</p>
        {category && (
          <span className={styles.categoryTag}>
            {category.icon} {categoryName(category.name)}
          </span>
        )}
      </div>
    </a>
  );
};

const Categories = () => {
  const { t, categoryName } = useI18n();
  const { apps, categories, loading, error } = useApps();
  const [activeCategory, setActiveCategory] = useState<string | null>(DEFAULT_CATEGORY_ID);

  const filteredApps = useMemo(() => {
    if (!activeCategory) return apps;
    return getAppsByCategory(apps, activeCategory);
  }, [activeCategory, apps]);

  usePageMeta({
    title: t("categories.metaTitle"),
    description: t("categories.metaDescription"),
    canonical: "https://pwaland.brandonxiang.top/categories",
    keywords:
      "PWA categories, Progressive Web App categories, PWA directory categories, web app categories",
    openGraph: {
      title: t("categories.metaTitle"),
      description: t("categories.metaDescription"),
      url: "https://pwaland.brandonxiang.top/categories",
      image: "https://pwaland.brandonxiang.top/og-image.jpg",
    },
  });

  return (
    <div className={styles.categoriesPage}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroBadge}>{t("categories.badge")}</div>
          <h1 className={styles.heroTitle}>{t("categories.title")}</h1>
          <p className={styles.heroSub}>{t("categories.subtitle")}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          {loading && apps.length === 0 && (
            <div className={styles.loadingState}>
              <span className={styles.loader} aria-hidden="true" />
              <p>{t("home.loading")}</p>
            </div>
          )}

          {error && apps.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>⚠️</span>
              <h2 className={styles.emptyTitle}>{t("home.loadFailed")}</h2>
              <p className={styles.emptyDesc}>{error}</p>
            </div>
          )}

          {categories.length > 0 && (
            <>
              <div className={styles.categoryGrid}>
                <button
                  className={`${styles.categoryCard} ${activeCategory === null ? styles.categoryActive : ""}`}
                  onClick={() => setActiveCategory(null)}
                  aria-pressed={activeCategory === null}
                >
                  <span className={styles.categoryEmoji}>✦</span>
                  <span className={styles.categoryName}>{t("categories.all")}</span>
                  <span className={styles.categoryCount}>{apps.length}</span>
                </button>
                {categories.map((category) => {
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      className={`${styles.categoryCard} ${isActive ? styles.categoryActive : ""}`}
                      onClick={() => setActiveCategory(category.id)}
                      aria-pressed={isActive}
                      style={
                        isActive
                          ? {
                              background: category.gradient,
                              color: "#fff",
                              borderColor: "transparent",
                            }
                          : {}
                      }
                    >
                      <span className={styles.categoryEmoji}>{category.icon}</span>
                      <span className={styles.categoryName}>{categoryName(category.name)}</span>
                      <span className={styles.categoryCount}>{category.count}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {t("categories.showing", {
                    count: filteredApps.length,
                    plural: filteredApps.length === 1 ? "" : "s",
                  })}
                </h2>
                {filteredApps.length === 0 && (
                  <p className={styles.sectionSub}>{t("categories.empty")}</p>
                )}
              </div>

              <VirtualAppGrid
                apps={filteredApps}
                categories={categories}
                hasMore={false}
                loadingMore={false}
                onLoadMore={() => undefined}
                renderCard={(app, cats) => <AppCard key={app.id} app={app} allCategories={cats} />}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Categories;
