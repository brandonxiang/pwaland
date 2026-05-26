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
  tags: string[];
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

export const OTHER_CATEGORY_ID = "other";

export const CATEGORY_META: Record<string, CategoryMeta> = {
  reading: {
    name: "Reading",
    icon: "📖",
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED, #6D28D9)",
  },
  social: {
    name: "Social",
    icon: "💬",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6, #6366F1)",
  },
  productivity: {
    name: "Productivity",
    icon: "⚡",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
  },
  entertainment: {
    name: "Entertainment",
    icon: "🎵",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)",
  },
  shopping: {
    name: "Shopping",
    icon: "🛍️",
    color: "#F43F5E",
    gradient: "linear-gradient(135deg, #F43F5E, #E11D48)",
  },
  education: {
    name: "Education",
    icon: "📚",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
  },
  games: {
    name: "Games",
    icon: "🎮",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444, #DC2626)",
  },
  health: {
    name: "Health & Fitness",
    icon: "🏃",
    color: "#14B8A6",
    gradient: "linear-gradient(135deg, #14B8A6, #0D9488)",
  },
  news: {
    name: "News & Weather",
    icon: "📰",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1, #4F46E5)",
  },
  tools: {
    name: "Tools",
    icon: "🔧",
    color: "#64748B",
    gradient: "linear-gradient(135deg, #64748B, #475569)",
  },
  utilities: {
    name: "Utilities",
    icon: "🧰",
    color: "#0F766E",
    gradient: "linear-gradient(135deg, #0F766E, #115E59)",
  },
  finance: {
    name: "Finance",
    icon: "💰",
    color: "#22C55E",
    gradient: "linear-gradient(135deg, #22C55E, #16A34A)",
  },
  design: {
    name: "Design",
    icon: "🎨",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #DB2777)",
  },
  music: {
    name: "Music",
    icon: "🎵",
    color: "#A855F7",
    gradient: "linear-gradient(135deg, #A855F7, #9333EA)",
  },
  family: {
    name: "Family",
    icon: "🏡",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #F97316, #EA580C)",
  },
  travel: {
    name: "Travel",
    icon: "🧭",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9, #0284C7)",
  },
  government: {
    name: "Government",
    icon: "🏛️",
    color: "#475569",
    gradient: "linear-gradient(135deg, #475569, #334155)",
  },
  sports: {
    name: "Sports",
    icon: "🏅",
    color: "#84CC16",
    gradient: "linear-gradient(135deg, #84CC16, #65A30D)",
  },
  [OTHER_CATEGORY_ID]: {
    name: "Other",
    icon: "📂",
    color: "#64748B",
    gradient: "linear-gradient(135deg, #64748B, #475569)",
  },
};

const CATEGORY_ALIASES: Record<string, string> = {
  books: "reading",
  book: "reading",
  reading: "reading",
  图书阅读: "reading",
  social: "social",
  chat: "social",
  聊天社交: "social",
  productivity: "productivity",
  office: "productivity",
  效率办公: "productivity",
  entertainment: "entertainment",
  media: "entertainment",
  video: "entertainment",
  music: "entertainment",
  影音图片: "entertainment",
  shopping: "shopping",
  时尚购物: "shopping",
  education: "education",
  learning: "education",
  学习教育: "education",
  games: "games",
  game: "games",
  游戏: "games",
  health: "health",
  fitness: "health",
  "health-fitness": "health",
  "health-and-fitness": "health",
  医疗健康: "health",
  news: "news",
  weather: "news",
  "news-weather": "news",
  "news-and-weather": "news",
  新闻资讯: "news",
  tools: "tools",
  tool: "tools",
  developer: "tools",
  "developer-tools": "tools",
  devtools: "tools",
  开发工具: "tools",
  utilities: "utilities",
  utility: "utilities",
  实用工具: "utilities",
  finance: "finance",
  金融理财: "finance",
  design: "design",
  family: "family",
  kids: "family",
  children: "family",
  儿童家庭: "family",
  travel: "travel",
  transportation: "travel",
  旅游交通: "travel",
  government: "government",
  public: "government",
  政府公共: "government",
  sports: "sports",
  sport: "sports",
  体育运动: "sports",
  other: OTHER_CATEGORY_ID,
  uncategorized: OTHER_CATEGORY_ID,
  未分类: OTHER_CATEGORY_ID,
  其他: OTHER_CATEGORY_ID,
};

export function normalizeCategoryId(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return OTHER_CATEGORY_ID;

  const key = raw
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return CATEGORY_ALIASES[key] ?? CATEGORY_ALIASES[raw] ?? OTHER_CATEGORY_ID;
}

export function normalizeTags(tags?: string[] | null): string[] {
  const normalized = (tags ?? []).map(normalizeCategoryId);
  const unique = [...new Set(normalized)];
  return unique.length > 0 ? unique : [OTHER_CATEGORY_ID];
}

const FALLBACK_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#14B8A6",
  "#3B82F6",
  "#F43F5E",
  "#64748B",
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
    icon: "📂",
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
    const category = normalizeCategoryId(app.category);
    countMap.set(category, (countMap.get(category) || 0) + 1);
  }

  return Array.from(countMap.entries()).map(([id, count]) => {
    const meta = CATEGORY_META[id] ?? fallbackCategoryMeta(id);
    return { id, count, ...meta };
  });
}

export const getAppsByCategory = (apps: PWAApp[], categoryId: string): PWAApp[] => {
  const normalizedCategoryId = normalizeCategoryId(categoryId);
  return apps.filter((app) => normalizeCategoryId(app.category) === normalizedCategoryId);
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
      app.developer.toLowerCase().includes(q) ||
      app.tags?.some((tag) => tag.toLowerCase().includes(q)),
  );
};
