/// <reference types="vite/client" />
/**
 * Instagram Graph API — получение медиа аккаунта во время сборки (SSG).
 *
 * Требования:
 *  1. Instagram Business или Creator аккаунт.
 *  2. Facebook App с продуктом "Instagram".
 *  3. Долгосрочный (long-lived) токен доступа → INSTAGRAM_ACCESS_TOKEN в .env
 *     Срок действия: 60 дней. Продлевается автоматически при каждом обращении к API.
 *
 * Получение токена:
 *  https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started
 */

export interface InstagramPost {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  /** URL изображения (для VIDEO используйте thumbnail_url) */
  media_url: string;
  /** Превью для VIDEO */
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

interface ApiResponse {
  data: InstagramPost[];
  error?: { message: string; code: number };
}

/**
 * Загружает последние посты из Instagram Graph API.
 * Вызывается ТОЛЬКО в server-side / build-time контексте Astro.
 *
 * @param limit  Количество постов (max 100, по умолчанию 9)
 * @returns      Массив постов или пустой массив при ошибке
 */
export async function fetchInstagramPosts(limit = 9): Promise<InstagramPost[]> {
  const token = import.meta.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    console.warn(
      '[instagram] INSTAGRAM_ACCESS_TOKEN не задан в .env — посты не будут загружены.',
    );
    return [];
  }

  const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${token}`;

  try {
    const res = await fetch(url);
    const json: ApiResponse = await res.json();

    if (!res.ok || json.error) {
      console.error('[instagram] Ошибка API:', json.error?.message ?? res.statusText);
      return [];
    }

    // Фильтруем CAROUSEL_ALBUM — у них нет прямого media_url на верхнем уровне
    // Оставляем IMAGE и VIDEO (для VIDEO показываем thumbnail)
    return json.data.filter(
      (p) => p.media_type === 'IMAGE' || p.media_type === 'VIDEO' || p.media_type === 'CAROUSEL_ALBUM',
    );
  } catch (err) {
    console.error('[instagram] Сетевая ошибка:', err);
    return [];
  }
}

/** Возвращает URL для отображения — изображение или превью видео */
export function getDisplayUrl(post: InstagramPost): string {
  return post.media_type === 'VIDEO'
    ? (post.thumbnail_url ?? post.media_url)
    : post.media_url;
}

/** Форматирует дату поста в читаемый вид (ru-RU) */
export function formatPostDate(timestamp: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(timestamp));
}
