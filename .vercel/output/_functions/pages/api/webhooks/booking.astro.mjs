export { renderers } from '../../../renderers.mjs';

const prerender = false;
const getValueFromResponses = (responses, keys) => {
  if (!responses) return void 0;
  if (Array.isArray(responses)) {
    const normalizedKeys = keys.map((key) => key.toLowerCase());
    const match = responses.find((item) => {
      const itemKey = String(item.key ?? item.label ?? "").toLowerCase();
      return normalizedKeys.includes(itemKey);
    });
    return match?.value != null ? String(match.value) : void 0;
  }
  for (const key of keys) {
    const value = responses[key];
    if (value != null && value !== "") {
      return String(value);
    }
  }
  return void 0;
};
const normalizePayload = (payload) => payload.booking ?? payload;
const GET = async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "Booking webhook is ready"
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};
const POST = async ({ request }) => {
  const rawBody = await request.text();
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    console.error("[booking-webhook] Invalid JSON body", { rawBody, error });
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Invalid JSON body"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  const booking = normalizePayload(payload);
  const responses = booking.responses;
  booking.title ?? "Ne ukazano";
  booking.startTime ?? booking.start ?? "Ne ukazano";
  const attendee = booking.attendees?.[0];
  attendee?.name ?? "Ne ukazano";
  attendee?.email ?? getValueFromResponses(responses, ["email"]) ?? "Ne ukazano";
  attendee?.phoneNumber ?? getValueFromResponses(responses, ["phone", "phoneNumber", "telefon", "tel"]) ?? "Ne ukazano";
  const botToken = undefined                                  ;
  const chatId = undefined                                ;
  {
    console.error("[booking-webhook] Missing Telegram env vars", {
      hasBotToken: Boolean(botToken),
      hasChatId: Boolean(chatId)
    });
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID/TELEGRAM_CHAT_ID"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
