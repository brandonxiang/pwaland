export const OTHER_CATEGORY_ID = "other";

const CATEGORY_ALIASES: Record<string, string> = {
  reading: "reading",
  books: "reading",
  book: "reading",
  图书阅读: "reading",
  social: "social",
  chat: "social",
  聊天社交: "social",
  tools: "tools",
  tool: "tools",
  developer: "tools",
  "developer-tools": "tools",
  devtools: "tools",
  开发工具: "tools",
  productivity: "productivity",
  office: "productivity",
  效率办公: "productivity",
  games: "games",
  game: "games",
  游戏: "games",
  utilities: "utilities",
  utility: "utilities",
  实用工具: "utilities",
  entertainment: "entertainment",
  media: "entertainment",
  video: "entertainment",
  music: "entertainment",
  影音图片: "entertainment",
  shopping: "shopping",
  时尚购物: "shopping",
  health: "health",
  fitness: "health",
  "health-fitness": "health",
  "health-and-fitness": "health",
  医疗健康: "health",
  family: "family",
  kids: "family",
  children: "family",
  儿童家庭: "family",
  travel: "travel",
  transportation: "travel",
  旅游交通: "travel",
  news: "news",
  weather: "news",
  "news-weather": "news",
  "news-and-weather": "news",
  新闻资讯: "news",
  education: "education",
  learning: "education",
  学习教育: "education",
  finance: "finance",
  金融理财: "finance",
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

export function normalizeCategoryTags(tags?: string[] | null): string[] {
  const normalized = (tags ?? []).map(normalizeCategoryId);
  const unique = [...new Set(normalized)];
  return unique.length > 0 ? unique : [OTHER_CATEGORY_ID];
}
