import type { APIRoute } from 'astro';

type CalBookingPayload = {
  title?: string;
  startTime?: string;
  attendees?: Array<{
    name?: string;
  }>;
  responses?: {
    phone?: string;
  };
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = (await request.json()) as CalBookingPayload;

    const title = payload.title ?? 'Не указано';
    const startTime = payload.startTime ?? 'Не указано';
    const name = payload.attendees?.[0]?.name ?? 'Не указано';
    const phone = payload.responses?.phone ?? 'Не указано';

    const message = `🔔 Новая заявка! \n Услуга: ${title} \n Время: ${startTime} \n Клиент: ${name} \n Телефон: ${phone}`;

    const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      await fetch(`https://api.telegram.org/bot${import.meta.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};