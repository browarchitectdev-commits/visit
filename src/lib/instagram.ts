/// <reference types="vite/client" />

export interface InstagramPost {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

interface ApiResponse {
  data: InstagramPost[];
  error?: { message: string; code: number };
}

export async function fetchInstagramPosts(limit = 9): Promise<InstagramPost[]> {
  const token = import.meta.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    console.warn('[instagram] INSTAGRAM_ACCESS_TOKEN non è impostato in .env, i post non verranno caricati.');
    return [];
  }

  const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${token}`;

  try {
    const res = await fetch(url);
    const json: ApiResponse = await res.json();

    if (!res.ok || json.error) {
      console.error('[instagram] Errore API:', json.error?.message ?? res.statusText);
      return [];
    }

    return json.data.filter(
      (post) => post.media_type === 'IMAGE' || post.media_type === 'VIDEO' || post.media_type === 'CAROUSEL_ALBUM',
    );
  } catch (err) {
    console.error('[instagram] Errore di rete:', err);
    return [];
  }
}

export function getDisplayUrl(post: InstagramPost): string {
  return post.media_type === 'VIDEO'
    ? (post.thumbnail_url ?? post.media_url)
    : post.media_url;
}

export function formatPostDate(timestamp: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(timestamp));
}
