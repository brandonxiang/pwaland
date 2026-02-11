import { FastifyInstance } from 'fastify';
import { fail, success } from '../../utils';
import { notion, PWADatabaseId } from '../../model/notion';

interface AddPwaBody {
  title: string;
  link: string;
  icon: string;
  description?: string;
  tags?: string[];
}

/**
 * Check if a PWA with the same link already exists in the Notion database
 */
async function checkDuplicate(link: string): Promise<boolean> {
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

export default (fastify: FastifyInstance, _: any, done: any) => {
  fastify.post<{
    Body: AddPwaBody;
  }>('/add', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'link', 'icon'],
        properties: {
          title: { type: 'string' },
          link: { type: 'string' },
          icon: { type: 'string' },
          description: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  }, async (req, res) => {
    const { title, link, icon, description, tags } = req.body;

    if (!title || !link || !icon) {
      return res.send(fail('title, link, and icon are required'));
    }

    try {
      // Check for duplicates
      const exists = await checkDuplicate(link);
      if (exists) {
        return res.send(fail(`A PWA with link "${link}" already exists in the database`));
      }

      // Build multi_select tags
      const multiSelect = (tags && tags.length > 0)
        ? tags.map(name => ({ name }))
        : [{ name: 'Uncategorized' }];

      // Insert into Notion
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

      return res.send(success({
        id: response.id,
        message: `Successfully added "${title}" to PWALand`,
      }));
    } catch (err: any) {
      fastify.log.error(err, 'Failed to add PWA to Notion');
      return res.send(fail(`Failed to add PWA: ${err.message}`));
    }
  });

  done();
};
