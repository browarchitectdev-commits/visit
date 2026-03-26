import type { APIRoute } from 'astro';

export const prerender = false;

type BookingAttendee = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  timeZone?: string;
};

type BookingResponseRecord =
  | string
  | number
  | boolean
  | null
  | undefined
  | {
      label?: string;
      value?: string | number | boolean | null | { value?: string; optionValue?: string };
      isHidden?: boolean;
    };

type BookingResponses =
  | Record<string, BookingResponseRecord>
  | Array<{
      key?: string;
      label?: string;
      value?: string | number | boolean | null;
    }>;

type BookingOrganizer = {
  name?: string;
  email?: string;
  timeZone?: string;
};

type VideoCallData = {
  url?: string;
};

type DestinationCalendar = {
  integration?: string;
  primaryEmail?: string;
  externalId?: string;
};

type NormalizedBookingPayload = {
  title?: string;
  eventTitle?: string;
  eventDescription?: string;
  type?: string;
  description?: string;
  startTime?: string;
  start?: string;
  endTime?: string;
  attendees?: BookingAttendee[];
  responses?: BookingResponses;
  organizer?: BookingOrganizer;
  additionalNotes?: string;
  status?: string;
  bookingId?: number;
  uid?: string;
  price?: number;
  currency?: string;
  length?: number;
  location?: string;
  videoCallData?: VideoCallData;
  destinationCalendar?: DestinationCalendar[];
  requiresConfirmation?: boolean;
};

type CalBookingPayload = {
  triggerEvent?: string;
  payload?: NormalizedBookingPayload;
  booking?: NormalizedBookingPayload;
} & NormalizedBookingPayload;

const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: 'Confirmata',
  PENDING: 'In asteptare',
  CANCELLED: 'Anulata',
  REJECTED: 'Respinsa',
};

const TRIGGER_LABELS: Record<string, string> = {
  BOOKING_CREATED: 'Rezervare noua',
  BOOKING_REJECTED: 'Rezervare respinsa',
  BOOKING_CANCELLED: 'Rezervare anulata',
  BOOKING_RESCHEDULED: 'Rezervare reprogramata',
  BOOKING_PAYMENT_INITIATED: 'Plata initiata',
  BOOKING_PAID: 'Rezervare platita',
};

const CAL_UPCOMING_BOOKINGS_URL = 'https://app.cal.eu/bookings/upcoming';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const getStringValue = (value: unknown) => {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    const nestedValue =
      'value' in value && (typeof value.value === 'string' || typeof value.value === 'number' || typeof value.value === 'boolean')
        ? String(value.value)
        : undefined;
    const optionValue =
      'optionValue' in value &&
      (typeof value.optionValue === 'string' || typeof value.optionValue === 'number' || typeof value.optionValue === 'boolean')
        ? String(value.optionValue)
        : undefined;

    return nestedValue ?? optionValue;
  }

  return undefined;
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
    const directValue =
      value && typeof value === 'object' && !Array.isArray(value) && 'value' in value ? getStringValue(value.value) : getStringValue(value);

    if (directValue) {
      return directValue;
    }
  }

  return undefined;
};

const normalizePayload = (payload: CalBookingPayload) => payload.payload ?? payload.booking ?? payload;

const formatDateTime = (value: string | undefined, timeZone: string | undefined) => {
  if (!value) return 'Nu este indicat';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timeZone ?? 'Europe/Chisinau',
  }).format(parsed);
};

const getGoogleCalendarUrl = (destinationCalendar: DestinationCalendar | undefined) => {
  const externalId = destinationCalendar?.externalId;
  if (!externalId) return undefined;

  return `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(externalId)}`;
};

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
  const attendee = booking.attendees?.[0];
  const timeZone = attendee?.timeZone ?? booking.organizer?.timeZone ?? 'Europe/Chisinau';

  const service =
    booking.eventTitle ??
    booking.type ??
    booking.title ??
    getValueFromResponses(responses, ['title', 'what_is_this_meeting_about']) ??
    'Nu este indicat';
  const startTime = formatDateTime(booking.startTime ?? booking.start, timeZone);
  const endTime = formatDateTime(booking.endTime, timeZone);
  const attendeeFullName = [attendee?.firstName, attendee?.lastName].filter(Boolean).join(' ');
  const clientName = attendee?.name || attendeeFullName || getValueFromResponses(responses, ['name', 'your_name']) || 'Nu este indicat';
  const email =
    attendee?.email ?? getValueFromResponses(responses, ['email', 'email_address']) ?? 'Nu este indicat';
  const phone =
    attendee?.phoneNumber ??
    getValueFromResponses(responses, ['phone', 'phoneNumber', 'telefon', 'tel', 'attendeePhoneNumber', 'phone_number']) ??
    'Nu este indicat';
  const notes =
    booking.additionalNotes ||
    getValueFromResponses(responses, ['notes', 'additional_notes']) ||
    booking.eventDescription ||
    booking.description;
  const location =
    getValueFromResponses(responses, ['location']) ?? booking.videoCallData?.url ?? booking.location ?? undefined;
  const organizerName = booking.organizer?.name ?? 'Nu este indicat';
  const organizerEmail = booking.organizer?.email ?? undefined;
  const status = booking.status ? STATUS_LABELS[booking.status] ?? booking.status : undefined;
  const destinationCalendar = booking.destinationCalendar?.[0];
  const calendarSummary = destinationCalendar
    ? [destinationCalendar.integration, destinationCalendar.primaryEmail].filter(Boolean).join(' - ')
    : undefined;
  const triggerLabel = payload.triggerEvent ? TRIGGER_LABELS[payload.triggerEvent] ?? payload.triggerEvent : 'Actualizare rezervare';
  const googleCalendarUrl = getGoogleCalendarUrl(destinationCalendar);

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
    `<b>${escapeHtml(triggerLabel)}</b>`,
    booking.bookingId ? `ID rezervare: <code>${booking.bookingId}</code>` : '',
    status ? `Status: <b>${escapeHtml(status)}</b>` : '',
    `Serviciu: <b>${escapeHtml(service)}</b>`,
    booking.length ? `Durata: ${booking.length} min` : '',
    `Data: ${escapeHtml(startTime)}`,
    booking.endTime ? `Final: ${escapeHtml(endTime)}` : '',
    `Fus orar: ${escapeHtml(timeZone)}`,
    `Client: <b>${escapeHtml(clientName)}</b>`,
    `Telefon: <code>${escapeHtml(phone)}</code>`,
    `Email: <code>${escapeHtml(email)}</code>`,
    booking.requiresConfirmation ? 'Necesita confirmare: Da' : '',
    notes ? `Detalii: ${escapeHtml(notes)}` : '',
    location ? `Locatie / video: ${escapeHtml(location)}` : '',
    `Organizator: ${escapeHtml(organizerName)}`,
    organizerEmail ? `Email organizator: <code>${escapeHtml(organizerEmail)}</code>` : '',
    calendarSummary ? `Calendar: ${escapeHtml(calendarSummary)}` : '',
    booking.uid ? `UID: <code>${escapeHtml(booking.uid)}</code>` : '',
    '',
    `<a href="${CAL_UPCOMING_BOOKINGS_URL}">Deschide rezervarile in Cal.com</a>`,
    googleCalendarUrl ? `<a href="${googleCalendarUrl}">Deschide Google Calendar</a>` : '',
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
        parse_mode: 'HTML',
        disable_web_page_preview: true,
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
      service,
      startTime,
      clientName,
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
