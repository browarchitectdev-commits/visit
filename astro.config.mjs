import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-beauty-salon.com', // Замените на реальный домен
  output: 'server',
  adapter: vercel(),
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
  // Vite конфигурация для path aliases
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
