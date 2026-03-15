/**
 * Content Collections Configuration
 * 
 * Определяет схемы для всех коллекций контента.
 * TinaCMS будет редактировать эти файлы через Git.
 * Zod обеспечивает типобезопасность и валидацию.
 */

import { defineCollection, z } from 'astro:content';

/**
 * Коллекция "Услуги"
 * Хранит информацию об услугах салона красоты
 */
const servicesCollection = defineCollection({
  type: 'data', // JSON-файлы (можно также использовать 'content' для Markdown)
  schema: ({ image }) => z.object({
    // Название услуги (например, "Перманентный макияж бровей")
    name: z.string()
      .min(3, 'Название должно содержать минимум 3 символа')
      .max(100, 'Название слишком длинное'),
    
    // Цена в рублях (число, не строка - для сортировки и фильтрации)
    price: z.number()
      .positive('Цена должна быть положительным числом')
      .int('Цена должна быть целым числом'),
    
    // Длительность процедуры в минутах
    duration: z.number()
      .positive('Длительность должна быть положительной')
      .int('Длительность должна быть целым числом'),
    
    // Подробное описание услуги (может содержать HTML для форматирования)
    description: z.string()
      .min(20, 'Описание должно быть информативным')
      .max(1000, 'Описание слишком длинное'),
    
    // Изображение услуги (оптимизируется через astro:assets)
    image: image(),
    
    // Порядок отображения на странице (опционально)
    order: z.number().int().optional(),
    
    // Активна ли услуга (для скрытия без удаления из CMS)
    isActive: z.boolean().default(true),
  }),
});

/**
 * Коллекция "Мастера"
 * Хранит информацию о специалистах салона
 */
const mastersCollection = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    // Полное имя мастера
    name: z.string()
      .min(2, 'Имя слишком короткое')
      .max(100, 'Имя слишком длинное'),
    
    // Должность/специализация (например, "Мастер перманентного макияжа")
    position: z.string()
      .min(3, 'Должность должна быть указана')
      .max(150, 'Должность слишком длинная'),
    
    // Опыт работы в годах
    experience: z.number()
      .nonnegative('Опыт не может быть отрицательным')
      .int('Опыт должен быть целым числом'),
    
    // Биография/описание (история, достижения, сертификаты)
    bio: z.string()
      .min(50, 'Биография должна быть подробной')
      .max(2000, 'Биография слишком длинная'),
    
    // Фотография мастера
    photo: image(),
    
    // Социальные сети (опционально)
    instagram: z.string().url().optional(),
    telegram: z.string().url().optional(),
    
    // Порядок отображения
    order: z.number().int().optional(),
    
    // Активен ли мастер (для временного скрытия)
    isActive: z.boolean().default(true),
  }),
});

/**
 * Коллекция "Галерея"
 * Хранит фотографии работ "до/после"
 */
const galleryCollection = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    // Название работы (например, "Перманентный макияж бровей")
    title: z.string()
      .min(3, 'Название должно содержать минимум 3 символа')
      .max(150, 'Название слишком длинное'),
    
    // Категория/тип услуги
    category: z.enum(['brouws', 'lips', 'eyeliner', 'nails', 'face', 'other'], {
      errorMap: () => ({ message: 'Выберите категорию' }),
    }),
    
    // Описание работы
    description: z.string()
      .min(10, 'Описание должно быть информативным')
      .max(500, 'Описание слишком длинное'),
    
    // Фото "до"
    imageBefore: image(),
    
    // Фото "после"
    imageAfter: image(),
    
    // Имя мастера (опционально)
    masterName: z.string().optional(),
    
    // Дата выполнения работы (опционально)
    date: z.date().optional(),
    
    // Порядок отображения
    order: z.number().int().optional(),
    
    // Активна ли запись
    isActive: z.boolean().default(true),
  }),
});

/**
 * Коллекция "Социальные сети"
 * Хранит ссылки на посты для страницы /social
 */
const socialCollection = defineCollection({
  type: 'data',
  schema: z.object({
    // Поддерживаем Instagram и TikTok
    platform: z.enum(['instagram', 'tiktok']).default('instagram'),

    // Полная ссылка на пост (например: https://www.instagram.com/p/ABC123/)
    postUrl: z.string().url('Введите корректную ссылку на пост'),

    // Краткий заголовок для админки и a11y (опционально)
    title: z.string().max(120, 'Слишком длинный заголовок').optional(),

    // Подпись карточки (опционально)
    caption: z.string().max(280, 'Слишком длинная подпись').optional(),

    // Порядок отображения
    order: z.number().int().optional(),

    // Показывать ли запись на сайте
    isActive: z.boolean().default(true),
  }),
});

/**
 * Коллекция "Настройки"
 * Хранит глобальные настройки сайта (пока: соцсети)
 */
const settingsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    instagramProfileUrl: z.string().url('Введите корректную ссылку на Instagram профиль'),
    instagramUsername: z.string().min(1, 'Укажите username без @'),
    tiktokProfileUrl: z.string().url('Введите корректную ссылку на TikTok профиль'),
    tiktokUsername: z.string().min(1, 'Укажите username TikTok без @'),
  }),
});

/**
 * Экспорт коллекций
 * Astro автоматически сгенерирует типы TypeScript на их основе
 */
export const collections = {
  services: servicesCollection,
  masters: mastersCollection,
  gallery: galleryCollection,
  social: socialCollection,
  settings: settingsCollection,
};
