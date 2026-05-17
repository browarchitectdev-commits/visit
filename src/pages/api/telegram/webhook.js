export const prerender = false;

const BOT_ENV_KEYS = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_ADMIN_CHAT_ID',
  'TELEGRAM_ADMIN_IDS',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_CALENDAR_ID',
  'GOOGLE_SERVICE_ACCOUNT_JSON',
];

const syncAstroEnvToProcess = () => {
  for (const [key, value] of Object.entries(import.meta.env ?? {})) {
    if (process.env[key] === undefined && typeof value === 'string') {
      process.env[key] = value;
    }
  }
};

const getEnvPresence = (keys) =>
  Object.fromEntries(keys.map((key) => [key, Boolean(process.env[key])]));

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

const isAuthorizedTelegramRequest = (request) => {
  syncAstroEnvToProcess();

  const secret = process.env.BOT_WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  return request.headers.get('x-telegram-bot-api-secret-token') === secret;
};

export async function GET() {
  syncAstroEnvToProcess();

  const env = getEnvPresence(BOT_ENV_KEYS);
  const missingRequired = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_ADMIN_CHAT_ID',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ].filter((key) => !env[key]);
  const missingCalendar = ['GOOGLE_CALENDAR_ID', 'GOOGLE_SERVICE_ACCOUNT_JSON'].filter((key) => !env[key]);

  return json({
    ok: true,
    name: 'bot_vercel',
    mode: 'telegram-webhook',
    env,
    missingRequired,
    calendar: {
      configured: missingCalendar.length === 0,
      missing: missingCalendar,
    },
  });
}

export async function POST({ request }) {
  if (!isAuthorizedTelegramRequest(request)) {
    return json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let update;

  try {
    update = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  try {
    syncAstroEnvToProcess();
    const { processWebhookUpdate } = await import('../../../../bot_vercel/bot.mjs');
    const result = await processWebhookUpdate(update);
    return json({ ok: true, ...result });
  } catch (error) {
    console.error('[bot-vercel] Telegram webhook failed', error);
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
