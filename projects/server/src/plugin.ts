import { FastifyInstance } from "fastify";
import PwaParserRouter from './routes/pwa/parse';
import PwaCrawlerRouter from './routes/pwa/crawler';
import PwaCheckRouter from './routes/pwa/check';
import PwaAddRouter from './routes/pwa/add';
import PwaDiscoverRouter from './routes/pwa/discover';
import ClientListRouter from './routes/client/list';
import StarterListRouter from './routes/starter/list';

export default async function (fastify: FastifyInstance, _: any)  {
  fastify.register(PwaParserRouter, { prefix: '/api/pwa' });
  fastify.register(PwaCrawlerRouter, { prefix: '/api/pwa' });
  fastify.register(PwaCheckRouter, { prefix: '/api/pwa' });
  fastify.register(PwaAddRouter, { prefix: '/api/pwa' });
  fastify.register(PwaDiscoverRouter, { prefix: '/api/pwa' });
  fastify.register(ClientListRouter, { prefix: '/api/client' });
  fastify.register(StarterListRouter, { prefix: '/api/starter' });
}