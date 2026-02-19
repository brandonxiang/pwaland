export interface PWAApp {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  developer: string;
  rating: number;
  url: string;
  featured?: boolean;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  count: number;
}

interface CategoryMeta {
  name: string;
  icon: string;
  color: string;
  gradient: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  social: {
    name: 'Social',
    icon: '💬',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
  },
  productivity: {
    name: 'Productivity',
    icon: '⚡',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  entertainment: {
    name: 'Entertainment',
    icon: '🎵',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
  },
  shopping: {
    name: 'Shopping',
    icon: '🛍️',
    color: '#F43F5E',
    gradient: 'linear-gradient(135deg, #F43F5E, #E11D48)',
  },
  education: {
    name: 'Education',
    icon: '📚',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
  },
  games: {
    name: 'Games',
    icon: '🎮',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
  },
  health: {
    name: 'Health & Fitness',
    icon: '🏃',
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
  },
  news: {
    name: 'News & Weather',
    icon: '📰',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
  },
  tools: {
    name: 'Tools',
    icon: '🔧',
    color: '#64748B',
    gradient: 'linear-gradient(135deg, #64748B, #475569)',
  },
  finance: {
    name: 'Finance',
    icon: '💰',
    color: '#22C55E',
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
  },
  design: {
    name: 'Design',
    icon: '🎨',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
  },
  music: {
    name: 'Music',
    icon: '🎵',
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #A855F7, #9333EA)',
  },
};

const FALLBACK_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#14B8A6', '#3B82F6', '#F43F5E', '#64748B',
];

function fallbackCategoryMeta(id: string): CategoryMeta {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = ((hash % FALLBACK_COLORS.length) + FALLBACK_COLORS.length) % FALLBACK_COLORS.length;
  const color = FALLBACK_COLORS[idx];
  return {
    name: id.charAt(0).toUpperCase() + id.slice(1),
    icon: '📂',
    color,
    gradient: `linear-gradient(135deg, ${color}, ${color}CC)`,
  };
}

/**
 * Build Category[] from the actual apps data, merging with known CATEGORY_META.
 */
export function buildCategories(apps: PWAApp[]): Category[] {
  const countMap = new Map<string, number>();
  for (const app of apps) {
    countMap.set(app.category, (countMap.get(app.category) || 0) + 1);
  }

  return Array.from(countMap.entries()).map(([id, count]) => {
    const meta = CATEGORY_META[id] ?? fallbackCategoryMeta(id);
    return { id, count, ...meta };
  });
}

export const getAppsByCategory = (apps: PWAApp[], categoryId: string): PWAApp[] => {
  return apps.filter((app) => app.category === categoryId);
};

export const getFeaturedApps = (apps: PWAApp[]): PWAApp[] => {
  return apps.filter((app) => app.featured);
};

export const searchApps = (apps: PWAApp[], query: string): PWAApp[] => {
  const q = query.toLowerCase();
  return apps.filter(
    (app) =>
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.developer.toLowerCase().includes(q),
  );
};
