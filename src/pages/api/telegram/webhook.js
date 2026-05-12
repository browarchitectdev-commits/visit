import { processWebhookUpdate } from '../../../../bot_vercel/bot.mjs';

export const prerender = false;

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

const isAuthorizedTelegramRequest = (request) => {
  const secret = process.env.BOT_WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  return request.headers.get('x-telegram-bot-api-secret-token') === secret;
};

export async function GET() {
  return json({
    ok: true,
    name: 'bot_vercel',
    mode: 'telegram-webhook',
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
