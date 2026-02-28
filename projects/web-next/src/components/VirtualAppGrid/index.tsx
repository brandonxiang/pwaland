import { useRef, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import type { PWAApp, Category } from '@/data/apps';
import styles from './index.module.scss';

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
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  if (apps.length === 0 && !loadingMore) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>🔍</span>
        <h3 className={styles.emptyTitle}>No apps found</h3>
      </div>
    );
  }

  return (
    <div className={styles.virtualContainer}>
      <div className={styles.virtualRow}>
        {apps.map((app) => renderCard(app, categories))}
      </div>

      {hasMore && (
        <div
          ref={sentinelRef}
          data-testid="load-more-sentinel"
          className={styles.sentinel}
        />
      )}

      {loadingMore && (
        <div className={styles.loadingMore}>
          <LoadingOutlined style={{ fontSize: 24 }} />
          <p>Loading more apps...</p>
        </div>
      )}
    </div>
  );
}
