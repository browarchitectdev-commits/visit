import type { APIRoute } from 'astro';

export const prerender = false;

type BookingAttendee = {
  name?: string;
  email?: string;
  phoneNumber?: string;
};

type BookingResponses =
  | Record<string, string | number | boolean | null | undefined>
  | Array<{
      key?: string;
      label?: string;
      value?: string | number | boolean | null;
    }>;

type CalBookingPayload = {
  triggerEvent?: string;
  title?: string;
  startTime?: string;
  start?: string;
  attendees?: BookingAttendee[];
  responses?: BookingResponses;
  booking?: {
    title?: string;
    startTime?: string;
    start?: string;
    attendees?: BookingAttendee[];
    responses?: BookingResponses;
  };
};

const getValueFromResponses = (responses: BookingResponses | undefined, keys: string[]) => {
  if (!responses) return undefined;

  if (Array.isArray(responses)) {
    const normalizedKeys = keys.map((key) => key.toLowerCase());
    const match = responses.find((item) => {
      const itemKey = String(item.key ?? item.label ?? '').toLowerCase();
      return normalizedKeys.includes(itemKey);
    });

    return match?.value != null ? String(match.value) : undefined;
  }

  for (const key of keys) {
    const value = responses[key];
    if (value != null && value !== '') {
      return String(value);
    }
  }

  return undefined;
};

const normalizePayload = (payload: CalBookingPayload) => payload.booking ?? payload;

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      message: 'Booking webhook is ready',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();

  let payload: CalBookingPayload;

  try {
    payload = JSON.parse(rawBody) as CalBookingPayload;
  } catch (error) {
    console.error('[booking-webhook] Invalid JSON body', { rawBody, error });

    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Invalid JSON body',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const booking = normalizePayload(payload);
  const responses = booking.responses;

  const title = booking.title ?? 'Ne ukazano';
  const startTime = booking.startTime ?? booking.start ?? 'Ne ukazano';
  const attendee = booking.attendees?.[0];
  const name = attendee?.name ?? 'Ne ukazano';
  const email = attendee?.email ?? getValueFromResponses(responses, ['email']) ?? 'Ne ukazano';
  const phone =
    attendee?.phoneNumber ??
    getValueFromResponses(responses, ['phone', 'phoneNumber', 'telefon', 'tel']) ??
    'Ne ukazano';

  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.TELEGRAM_ADMIN_CHAT_ID ?? import.meta.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('[booking-webhook] Missing Telegram env vars', {
      hasBotToken: Boolean(botToken),
      hasChatId: Boolean(chatId),
    });

    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID/TELEGRAM_CHAT_ID',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const message = [
    'New booking request',
    `Service: ${title}`,
    `Time: ${startTime}`,
    `Client: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    payload.triggerEvent ? `Event: ${payload.triggerEvent}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const telegramText = await telegramResponse.text();

    if (!telegramResponse.ok) {
      console.error('[booking-webhook] Telegram API error', {
        status: telegramResponse.status,
        body: telegramText,
      });

      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Telegram API request failed',
          status: telegramResponse.status,
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    console.info('[booking-webhook] Telegram notification sent', {
      title,
      startTime,
      name,
    });

    return new Response(
      JSON.stringify({
        ok: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('[booking-webhook] Unexpected error while sending Telegram message', error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Unexpected server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
