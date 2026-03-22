export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async () => {
  return new Response(JSON.stringify({ message: "Booking webhook is ready" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request }) => {
  try {
    const payload = await request.json();
    const title = payload.title ?? "Не указано";
    const startTime = payload.startTime ?? "Не указано";
    const name = payload.attendees?.[0]?.name ?? "Не указано";
    const phone = payload.responses?.phone ?? "Не указано";
    const message = `🔔 Новая заявка! 
 Услуга: ${title} 
 Время: ${startTime} 
 Клиент: ${name} 
 Телефон: ${phone}`;
    const botToken = undefined                                  ;
    const chatId = undefined                                ;
    if (botToken && chatId) ;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
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
