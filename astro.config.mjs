import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://visit-weld.vercel.app',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }, // Это заставит Vercel использовать актуальную конфигурацию
  }),
  integrations: [
    tailwind(),
    react(),
    sitemap(),
  ],
  // Оптимизация сборки
  build: {
    inlineStylesheets: 'auto',
  },
  // Настройки изображений
  image: {
    domains: [],
    remotePatterns: [],
  },
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },
});
