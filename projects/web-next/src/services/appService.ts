import type { PWAApp, Category } from '@/data/apps';
import { CATEGORY_META, buildCategories } from '@/data/apps';
import { postRaw } from '@/utils/request';

interface NotionAppProperty {
  title: string;
  description: string;
  tags: string[];
  link: string;
  icon: string;
}

interface ClientListResponse {
  properties: NotionAppProperty[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface AppData {
  apps: PWAApp[];
  categories: Category[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = ((hash % 360) + 360) % 360;
  return `hsl(${h}, 60%, 45%)`;
}

function transformNotionApp(item: NotionAppProperty): PWAApp {
  const id = slugify(item.title || 'unknown');
  const category = item.tags?.[0]?.toLowerCase() || 'other';
  const meta = CATEGORY_META[category];
  const color = meta?.color ?? hashColor(item.title);

  return {
    id,
    name: item.title || 'Untitled',
    description: item.description || '',
    category,
    icon: item.icon || '',
    developer: '',
    rating: 0,
    url: item.link || '',
    featured: false,
    color,
    tags: item.tags || [],
  };
}

export interface PageResult {
  apps: PWAApp[];
  hasMore: boolean;
  nextCursor: string | null;
}

export async function fetchAppsPage(cursor?: string): Promise<PageResult> {
  const res = await postRaw<ClientListResponse>('/api/client/list', {
    start_cursor: cursor,
  });

  const apps = res.properties.map(transformNotionApp);

  return {
    apps,
    hasMore: res.has_more,
    nextCursor: res.next_cursor,
  };
}

export async function fetchAllApps(): Promise<AppData> {
  const allApps: PWAApp[] = [];
  let cursor: string | undefined;

  do {
    const res = await postRaw<ClientListResponse>('/api/client/list', {
      start_cursor: cursor,
    });

    const transformed = res.properties.map(transformNotionApp);
    allApps.push(...transformed);

    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  const categories = buildCategories(allApps);

  return { apps: allApps, categories };
}
