import Fastify from 'fastify';
import cors from '@fastify/cors';
import PwaParserRouter from './routes/pwa/parse';
import PwaCrawlerRouter from './routes/pwa/crawler';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import ClientListRouter from './routes/client/list';
import StarterListRouter from './routes/starter/list';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const { PORT, NODE_ENV } = process.env;

const server = Fastify({
  logger: 
  NODE_ENV === 'production' ? true : {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  },
});

server.register(cors, {
  origin: /(127.0.0.1|localhost)/,
  methods: 'GET,PUT,POST,DELETE,OPTIONS',
  credentials: true,
});

await server.register(swagger);

await server.register(swaggerUi, {
  routePrefix: '/docs',
});

server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public',
});

server.get('/api',  (req, res) => {
  res.status(200).send('welcome to fastify-starter');
});

server.register(PwaParserRouter, { prefix: '/api/pwa' });
server.register(PwaCrawlerRouter, { prefix: '/api/pwa' });
server.register(ClientListRouter, { prefix: '/api/client' });
server.register(StarterListRouter, { prefix: '/api/starter' });

const port = PORT ? +PORT : 3000;
console.log('process.env.PORT', PORT, port);

server.listen({host: '0.0.0.0', port}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(0);
  }

  server.log.info(`Server listening at ${address}`);
});

await server.ready();
server.swagger();

export default server;