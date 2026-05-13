import { Client } from '@notionhq/client';
import { getRequiredEnv } from '../config/env';

export const PWADatabaseId = getRequiredEnv('NOTION_PWA_DATABASE_ID');
export const StarterDatabaseId = getRequiredEnv('NOTION_STARTER_DATABASE_ID');
const notionApiKey = getRequiredEnv('NOTION_API_KEY');

export const notion = new Client({
  auth: notionApiKey,
});

const DEFAULT_NOTION_LIST_CACHE_TTL_MS = 5 * 60 * 1000;

type NotionQueryResponse = Awaited<ReturnType<typeof notion.databases.query>>;

interface NotionCacheEntry {
  expiresAt: number;
  response: NotionQueryResponse;
}

const notionDataCache = new Map<string, NotionCacheEntry>();

function getCacheTtlMs(): number {
  const raw = process.env.NOTION_LIST_CACHE_TTL_MS;
  if (!raw) return DEFAULT_NOTION_LIST_CACHE_TTL_MS;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_NOTION_LIST_CACHE_TTL_MS;
}

function cacheKey(databaseId: string, startCursor?: string): string {
  return `${databaseId}:${startCursor ?? 'first-page'}`;
}

export function clearNotionDataCache(): void {
  notionDataCache.clear();
}

export async function fetchNotionData(databaseId: string, start_cursor?: string) {
  const ttlMs = getCacheTtlMs();
  const key = cacheKey(databaseId, start_cursor);
  const cached = notionDataCache.get(key);

  if (ttlMs > 0 && cached && cached.expiresAt > Date.now()) {
    return cached.response;
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'title',
        direction: 'ascending',
      },
    ],
    start_cursor: start_cursor ? start_cursor : undefined,
  });

  if (ttlMs > 0) {
    notionDataCache.set(key, {
      expiresAt: Date.now() + ttlMs,
      response,
    });
  }

  return response;
}

interface NotionTextItem {
  plain_text: string;
}

interface NotionRichTextProperty {
  rich_text?: NotionTextItem[];
  title?: NotionTextItem[];
}

interface NotionUrlProperty {
  url?: string | null;
}

interface NotionMultiSelectProperty {
  multi_select?: { name: string }[];
}

export function parseNotionRichText(obj: unknown): string {
  const property = obj as NotionRichTextProperty;
  return property.rich_text?.map((s) => s.plain_text).join('') ?? '';
}

export function parseNotionUrl(obj: unknown): string {
  const property = obj as NotionUrlProperty;
  return property.url ?? '';
}

export function parseNotionMultiSelect(obj: unknown): string[] {
  const property = obj as NotionMultiSelectProperty;
  return property.multi_select?.map((s) => s.name) ?? [];
}

export function parseNotionTitle(obj: unknown): string {
  const property = obj as NotionRichTextProperty;
  return property.title?.map((s) => s.plain_text).join(' ') ?? '';
}
