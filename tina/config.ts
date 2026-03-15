import { defineConfig } from 'tinacms';

// Конфигурация TinaCMS
// Все коллекции синхронизированы с src/content/config.ts

const argv = typeof process !== 'undefined' && Array.isArray(process.argv) ? process.argv : [];
const isTinaDevCommand = argv.includes('dev');
const isLocalOnly = process.env.TINA_LOCAL_ONLY === 'true' && isTinaDevCommand;
const tinaClientId = isLocalOnly ? undefined : process.env.TINA_CLIENT_ID;
const tinaToken = isLocalOnly ? undefined : process.env.TINA_TOKEN;

export default defineConfig({
  // Git-based хранилище
  branch: 'main', // основная ветка
  clientId: tinaClientId, // GitHub OAuth Client ID (опционально)
  token: tinaToken, // GitHub Token (опционально)
  
  // Конфигурация сборки
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  // Конфигурация CMSMedia
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },

  // Схемы коллекций контента
  schema: {
    collections: [
      /**
       * Коллекция "Services" (Услуги)
       * Синхронизирована с src/content/services/
       */
      {
        label: 'Услуги',
        name: 'services',
        path: 'src/content/services',
        format: 'json',
        fields: [
          {
            type: 'string',
            label: 'Название услуги',
            name: 'name',
            description: 'Например: Перманентный макияж бровей',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value || value.length < 3) {
                  return 'Название должно содержать минимум 3 символа';
                }
                if (value.length > 100) {
                  return 'Название слишком длинное (максимум 100 символов)';
                }
              },
            },
          },
          {
            type: 'number',
            label: 'Цена (₽)',
            name: 'price',
            description: 'Цена услуги в рублях',
            required: true,
          },
          {
            type: 'number',
            label: 'Длительность (мин)',
            name: 'duration',
            description: 'Сколько минут длится процедура',
            required: true,
          },
          {
            type: 'string',
            label: 'Описание',
            name: 'description',
            description: 'Подробное описание услуги',
            required: true,
            ui: {
              component: 'textarea',
              validate: (value: any) => {
                if (!value || value.length < 20) {
                  return 'Описание должно быть минимум 20 символов';
                }
                if (value.length > 1000) {
                  return 'Описание слишком длинное (максимум 1000 символов)';
                }
              },
            },
          },
          {
            type: 'image',
            label: 'Изображение услуги',
            name: 'image',
            description: 'JPG или PNG, минимум 400x300px',
            required: true,
          },
          {
            type: 'number',
            label: 'Порядок отображения',
            name: 'order',
            description: 'Услуги сортируются по этому значению (по возрастанию)',
          },
          {
            type: 'boolean',
            label: 'Активна',
            name: 'isActive',
            description: 'Показывать ли эту услугу на сайте',
            ui: { defaultValue: true },
          },
        ],
      },

      /**
       * Коллекция "Masters" (Мастера)
       * Синхронизирована с src/content/masters/
       */
      {
        label: 'Мастера',
        name: 'masters',
        path: 'src/content/masters',
        format: 'json',
        fields: [
          {
            type: 'string',
            label: 'Полное имя',
            name: 'name',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value || value.length < 2) {
                  return 'Имя слишком короткое';
                }
                if (value.length > 100) {
                  return 'Имя слишком длинное';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Должность',
            name: 'position',
            description: 'Например: Мастер перманентного макияжа',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value || value.length < 3) {
                  return 'Должность должна быть указана';
                }
                if (value.length > 150) {
                  return 'Должность слишком длинная';
                }
              },
            },
          },
          {
            type: 'number',
            label: 'Опыт (лет)',
            name: 'experience',
            description: 'Количество лет работы',
            required: true,
          },
          {
            type: 'string',
            label: 'Биография',
            name: 'bio',
            description: 'Полное описание мастера, достижения, сертификаты',
            required: true,
            ui: {
              component: 'textarea',
              validate: (value: any) => {
                if (!value || value.length < 50) {
                  return 'Биография должна быть подробной (минимум 50 символов)';
                }
                if (value.length > 2000) {
                  return 'Биография слишком длинная (максимум 2000 символов)';
                }
              },
            },
          },
          {
            type: 'image',
            label: 'Фотография',
            name: 'photo',
            description: 'Портретная фото мастера, минимум 300x300px',
            required: true,
          },
          {
            type: 'string',
            label: 'Instagram',
            name: 'instagram',
            description: 'Полная ссылка на профиль (опционально)',
            ui: {
              validate: (value: any) => {
                if (value && !value.startsWith('http')) {
                  return 'Введите полную ссылку (https://...)';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Telegram',
            name: 'telegram',
            description: 'Полная ссылка на профиль (опционально)',
            ui: {
              validate: (value: any) => {
                if (value && !value.startsWith('http')) {
                  return 'Введите полную ссылку (https://...)';
                }
              },
            },
          },
          {
            type: 'number',
            label: 'Порядок отображения',
            name: 'order',
            description: 'Мастера сортируются по этому значению (по возрастанию)',
          },
          {
            type: 'boolean',
            label: 'Активен',
            name: 'isActive',
            description: 'Показывать ли этого мастера на сайте',
            ui: { defaultValue: true },
          },
        ],
      },

      /**
       * Коллекция "Gallery" (Галерея)
       * Синхронизирована с src/content/gallery/
       */
      {
        label: 'Галерея',
        name: 'gallery',
        path: 'src/content/gallery',
        format: 'json',
        fields: [
          {
            type: 'string',
            label: 'Название работы',
            name: 'title',
            description: 'Например: Перманентный макияж бровей',
            required: true,
          },
          {
            type: 'string',
            label: 'Категория',
            name: 'category',
            description: 'Тип услуги',
            required: true,
            options: [
              { label: 'Брови', value: 'brouws' },
              { label: 'Губы', value: 'lips' },
              { label: 'Межресничка', value: 'eyeliner' },
              { label: 'Ногти', value: 'nails' },
              { label: 'Уход за лицом', value: 'face' },
              { label: 'Другое', value: 'other' },
            ],
          },
          {
            type: 'string',
            label: 'Описание',
            name: 'description',
            description: 'Описание выполненной работы',
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'image',
            label: 'Фото "До"',
            name: 'imageBefore',
            description: 'Фотография до процедуры',
            required: true,
          },
          {
            type: 'image',
            label: 'Фото "После"',
            name: 'imageAfter',
            description: 'Фотография после процедуры',
            required: true,
          },
          {
            type: 'string',
            label: 'Имя мастера',
            name: 'masterName',
            description: 'Кто выполнил работу (опционально)',
          },
          {
            type: 'datetime',
            label: 'Дата выполнения',
            name: 'date',
            description: 'Когда была выполнена работа (опционально)',
          },
          {
            type: 'number',
            label: 'Порядок отображения',
            name: 'order',
            description: 'Работы сортируются по этому значению (по возрастанию)',
          },
          {
            type: 'boolean',
            label: 'Активна',
            name: 'isActive',
            description: 'Показывать ли эту работу на сайте',
            ui: { defaultValue: true },
          },
        ],
      },
      /**
       * Коллекция "Social" (Соцсети)
       * Синхронизирована с src/content/social/
       */
      {
        label: 'Соцсети',
        name: 'social',
        path: 'src/content/social',
        format: 'json',
        ui: {
          allowedActions: {
            create: true,
            delete: true,
          },
          // Формируем имя файла автоматически из ссылки на пост.
          filename: {
            slugify: (values: any) => {
              const platform = String(values?.platform ?? 'instagram').toLowerCase();
              const postUrl = String(values?.postUrl ?? '');
              const instagramMatch = postUrl.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
              const tiktokMatch = postUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);

              if (platform === 'tiktok' && tiktokMatch?.[1]) {
                return `tiktok-${tiktokMatch[1]}`;
              }

              if (instagramMatch?.[1]) {
                return `instagram-${instagramMatch[1].toLowerCase()}`;
              }

              const fallback = Date.now().toString().slice(-6);
              return `${platform}-post-${fallback}`;
            },
          },
        },
        fields: [
          {
            type: 'string',
            label: 'Платформа',
            name: 'platform',
            description: 'Выберите платформу для отображения карточки',
            required: true,
            options: [
              { label: 'Instagram', value: 'instagram' },
              { label: 'TikTok', value: 'tiktok' },
            ],
          },
          {
            type: 'string',
            label: 'Ссылка на пост',
            name: 'postUrl',
            description:
              'Сначала выберите платформу, затем вставьте ссылку на пост/видео. На сайте ID извлекается автоматически.',
            required: true,
            ui: {
              validate: (value: any, values: any) => {
                if (!value) {
                  return 'Ссылка обязательна';
                }
                if (!/^https?:\/\//i.test(value)) {
                  return 'Введите полную ссылку (https://...)';
                }

                const platform = String(values?.platform ?? 'instagram').toLowerCase();

                if (platform === 'instagram' && !/instagram\.com\/(p|reel|tv)\//i.test(value)) {
                  return 'Для Instagram укажите ссылку вида https://www.instagram.com/p/... или /reel/...';
                }

                if (platform === 'tiktok' && !/tiktok\.com\/@[^/]+\/video\/\d+/i.test(value)) {
                  return 'Для TikTok укажите ссылку вида https://www.tiktok.com/@username/video/123456789';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Заголовок',
            name: 'title',
            description: 'Краткое имя карточки (опционально)',
          },
          {
            type: 'string',
            label: 'Подпись',
            name: 'caption',
            description: 'Короткая подпись карточки (опционально)',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'number',
            label: 'Порядок отображения',
            name: 'order',
            description: 'Сортировка по возрастанию',
          },
          {
            type: 'boolean',
            label: 'Активно',
            name: 'isActive',
            description: 'Показывать ли пост на странице',
            ui: { defaultValue: true },
          },
        ],
      },
      /**
       * Коллекция "Настройки соцсетей"
       * Синхронизирована с src/content/settings/
       */
      {
        label: 'Настройки соцсетей',
        name: 'settings',
        path: 'src/content/settings',
        format: 'json',
        ui: {
          allowedActions: {
            create: true,
            delete: false,
          },
          filename: {
            readonly: true,
            slugify: () => 'social',
          },
        },
        fields: [
          {
            type: 'string',
            label: 'Instagram профиль URL',
            name: 'instagramProfileUrl',
            description: 'Например: https://www.instagram.com/browarchitect.studio/',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value) {
                  return 'Ссылка обязательна';
                }
                if (!/^https?:\/\//i.test(value)) {
                  return 'Введите полную ссылку (https://...)';
                }
                if (!/instagram\.com\//i.test(value)) {
                  return 'Ссылка должна вести на Instagram';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Instagram username',
            name: 'instagramUsername',
            description: 'Без символа @ (например: browarchitect.studio)',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value) {
                  return 'Username обязателен';
                }
                if (String(value).startsWith('@')) {
                  return 'Введите username без @';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'TikTok профиль URL',
            name: 'tiktokProfileUrl',
            description: 'Например: https://www.tiktok.com/@your_username',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value) {
                  return 'Ссылка обязательна';
                }
                if (!/^https?:\/\//i.test(value)) {
                  return 'Введите полную ссылку (https://...)';
                }
                if (!/tiktok\.com\//i.test(value)) {
                  return 'Ссылка должна вести на TikTok';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'TikTok username',
            name: 'tiktokUsername',
            description: 'Без символа @ (например: browarchitect)',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value) {
                  return 'Username обязателен';
                }
                if (String(value).startsWith('@')) {
                  return 'Введите username без @';
                }
              },
            },
          },
        ],
      },
    ],
  },
});
