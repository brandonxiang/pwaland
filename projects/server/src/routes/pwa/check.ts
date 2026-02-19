import { FastifyInstance } from 'fastify';
import { fail, success } from '../../utils';
import { checkPwa } from '../../services/pwa-checker';

export default (fastify: FastifyInstance, _: any, done: any) => {
  fastify.post<{
    Body: {
      url: string;
    };
  }>('/check', {
    schema: {
      body: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string' },
        },
      },
    },
  }, async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.send(fail('url is required'));
    }

    try {
      const checkResult = await checkPwa(url);
      return res.send(success(checkResult));
    } catch (err: any) {
      return res.send(fail(`PWA check failed: ${err.message}`));
    }
  });

  done();
};
