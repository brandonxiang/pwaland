import { Client } from '@notionhq/client';


export const PWADatabaseId = 'a39d3843c07f43cfa79c43ff7cf88c47';
export const StarterDatabaseId = '18716235c2cf8007aefcff58b0e7b3ca';
const notionApiKey = 'secret_G3MTRaQ29phFKeohjPVzQTfdhS7m841NgUqtRpmMWyw';

export const notion = new Client({
    auth: notionApiKey,
});

export async function fetchNotionData(databaseId: string, start_cursor?: string) {
    const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
            {
              "property": "title",
              "direction": "ascending"
            }
          ],
        start_cursor: start_cursor? start_cursor : undefined,
      });
      return response;
}

// 类型没导出
export function parseNotionRichText(obj: any): string {
  return obj.rich_text.map(s => s.plain_text).join("") as string;
}

export function parseNotionUrl(obj: any): string {
  return obj.url as string;
}

export function parseNotionMultiSelect(obj: any): string[] {
  return obj.multi_select.map(s => s.name);
}

export function parseNotionTitle(obj: any): string {
   return obj.title.map(s => s.plain_text).join(" ") as string;
}