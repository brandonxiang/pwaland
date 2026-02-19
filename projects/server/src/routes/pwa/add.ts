import { FastifyInstance } from 'fastify';
import { fail, success } from '../../utils';
import { checkDuplicate, addPwaToNotion, AddPwaData } from '../../services/pwa-store';

export default (fastify: FastifyInstance, _: any, done: any) => {
  fastify.post<{
    Body: AddPwaData;
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

      const result = await addPwaToNotion({ title, link, icon, description, tags });

      return res.send(success({
        id: result.id,
        message: `Successfully added "${title}" to PWALand`,
      }));
    } catch (err: any) {
      fastify.log.error(err, 'Failed to add PWA to Notion');
      return res.send(fail(`Failed to add PWA: ${err.message}`));
    }
  });

  done();
};
