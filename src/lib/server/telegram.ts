const TELEGRAM_API_BASE = 'https://api.telegram.org';

export const escapeTelegramHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const getTelegramConfig = (env: ImportMetaEnv) => {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_ADMIN_CHAT_ID ?? env.TELEGRAM_CHAT_ID;

  return {
    botToken,
    chatId,
  };
};

export const sendTelegramHtmlMessage = async (env: ImportMetaEnv, text: string) => {
  const { botToken, chatId } = getTelegramConfig(env);

  if (!botToken || !chatId) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID/TELEGRAM_CHAT_ID');
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(`Telegram API request failed (${response.status}): ${rawBody}`);
  }

  try {
    return JSON.parse(rawBody) as {
      ok: boolean;
      result?: {
        message_id?: number;
      };
    };
  } catch {
    return {
      ok: true,
    };
  }
};
