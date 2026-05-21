export interface PublicContactLinks {
  telegramUrl?: string;
}

const CONTACTS_FALLBACK_URL = '/contacts';

const normalizeExternalUrl = (value: string | undefined) => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed) || /^tg:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return undefined;
};

export const getPublicContactLinks = (): PublicContactLinks => ({
  telegramUrl: normalizeExternalUrl(import.meta.env.PUBLIC_TELEGRAM_BOT_URL) ?? CONTACTS_FALLBACK_URL,
});
