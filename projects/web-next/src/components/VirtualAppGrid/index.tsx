import { Fragment } from "react";
import type { PWAApp, Category } from "@/data/apps";
import { useI18n } from "@/providers/I18nProvider";
import styles from "./index.module.scss";

interface VirtualAppGridProps {
  apps: PWAApp[];
  categories: Category[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  renderCard: (app: PWAApp, allCategories: Category[]) => React.ReactNode;
}

export function VirtualAppGrid({
  apps,
  categories,
  hasMore,
  loadingMore,
  onLoadMore,
  renderCard,
}: VirtualAppGridProps) {
  const { t } = useI18n();

  if (apps.length === 0 && !loadingMore) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>🔍</span>
        <h3 className={styles.emptyTitle}>{t("grid.noApps")}</h3>
      </div>
    );
  }

  return (
    <div className={styles.virtualContainer}>
      <div className={styles.virtualRow}>
        {apps.map((app, index) => (
          <Fragment key={`${app.id}-${app.category}-${app.url}-${index}`}>
            {renderCard(app, categories)}
          </Fragment>
        ))}
      </div>

      {loadingMore && (
        <div className={styles.loadingMore}>
          <span className={styles.loader} aria-hidden="true" />
          <p>{t("grid.loadingMore")}</p>
        </div>
      )}

      {hasMore && !loadingMore && (
        <div className={styles.loadMoreWrap}>
          <button className={styles.loadMoreButton} type="button" onClick={onLoadMore}>
            {t("grid.loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
