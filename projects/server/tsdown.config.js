import { defineConfig } from 'tsdown';

export default defineConfig({
  // Entry point
  entry: ['src/server.ts', 'src/plugin.ts'],

  // Output configuration
  format: 'esm',
  outDir: 'dist',
  platform: 'node',

  // Use unbundle mode for better module structure
  unbundle: true,

  // TypeScript declaration files
  dts: false,

  // Environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_REGION: process.env.APP_REGION || 'sg',
    APP_ENV: process.env.APP_ENV || 'development',
  },

  // External dependencies (don't bundle these)
  external: [
    'fastify',
    '@fastify/autoload',
    '@fastify/swagger',
    '@fastify/swagger-ui',
    '@fastify/static',
    '@fastify/cors',
    'dayjs',
    'ioredis',
    'knex',
    'lodash',
    'mysql',
    'uuid',
    'pino-pretty',
    'puppeteer',
  ],

  // Enable shims for __dirname and __filename in ESM
  shims: true,

  // Clean output directory before build
  clean: true,

  // Source maps for debugging
  sourcemap: false,

  // Target ES2022 for modern Node.js
  target: 'node18',

  // Copy static files if any
  copy: [{ from: 'public', to: 'dist/public' }],
});
