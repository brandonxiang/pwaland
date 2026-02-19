import { notion, PWADatabaseId } from '../model/notion';

export interface AddPwaData {
  title: string;
  link: string;
  icon: string;
  description?: string;
  tags?: string[];
}

/**
 * Check if a PWA with the same link already exists in the Notion database
 */
export async function checkDuplicate(link: string): Promise<boolean> {
  const response = await notion.databases.query({
    database_id: PWADatabaseId,
    filter: {
      property: 'link',
      url: {
        equals: link,
      },
    },
  });

  return response.results.length > 0;
}

/**
 * Add a PWA entry to the Notion database.
 * Returns the created page ID.
 */
export async function addPwaToNotion(data: AddPwaData): Promise<{ id: string }> {
  const { title, link, icon, description, tags } = data;

  // Build multi_select tags
  const multiSelect = (tags && tags.length > 0)
    ? tags.map(name => ({ name }))
    : [{ name: 'Uncategorized' }];

  const response = await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: PWADatabaseId,
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      link: {
        type: 'url',
        url: link,
      },
      icon: {
        type: 'url',
        url: icon,
      },
      description: {
        type: 'rich_text',
        rich_text: [
          {
            text: {
              content: description || '',
            },
          },
        ],
      },
      tags: {
        type: 'multi_select',
        multi_select: multiSelect,
      },
    },
  });

  return { id: response.id };
}
