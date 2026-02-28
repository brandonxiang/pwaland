import path, { dirname } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  const viteEnv = loadEnv(mode, process.cwd());

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.APP_ENV': JSON.stringify(viteEnv.VITE_APP_ENV),
      'process.env.__DEV__': isDev,
    },
    build: {
      target: 'es2015',
      sourcemap: mode === 'production',
      rollupOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'react', test: /\/react(?:-dom|-router)?/ },
              { name: 'antd', test: /\/antd\/.*/ },
              { name: 'antv', test: /[\\/]node_modules[\\/]@antv[\\/]/ },
            ],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: viteEnv.VITE_API_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
        },
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'PWALand — Discover Progressive Web Apps',
          short_name: 'PWALand',
          description:
            'Discover, explore, and install the best Progressive Web Apps.',
          theme_color: '#1C1917',
          background_color: '#1C1917',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
      viteEnv.VITE_APP_VISUALIZER === 'true' && visualizer({ open: true }),
      createHtmlPlugin({
        minify: true,
      }),
    ],
  };
});
