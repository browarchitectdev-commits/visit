import process from 'node:process';
import { loadLocalEnvFile } from './env.mjs';
import { SupabaseStorage } from './storage.mjs';
import {
  createCalendarEvent,
  getAvailableSlotsForDate,
  isGoogleCalendarConfigured,
  listDateOptions,
  parseBookingDateTime,
} from './google-calendar.mjs';

loadLocalEnvFile();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const ADMIN_IDS = new Set(
  (process.env.TELEGRAM_ADMIN_IDS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
);
const BOOKING_TIME_ZONE = process.env.BOOKING_TIMEZONE ?? 'Europe/Chisinau';
const parsedBookingDurationMinutes = Number.parseInt(process.env.BOT_BOOKING_DURATION_MINUTES ?? '120', 10);
const DEFAULT_BOOKING_DURATION_MINUTES =
  Number.isFinite(parsedBookingDurationMinutes) && parsedBookingDurationMinutes > 0
    ? parsedBookingDurationMinutes
    : 120;
const parsedWorkingHoursStart = Number.parseInt(process.env.BOT_WORKING_HOURS_START ?? '9', 10);
const parsedWorkingHoursEnd = Number.parseInt(process.env.BOT_WORKING_HOURS_END ?? '19', 10);
const parsedSlotIntervalMinutes = Number.parseInt(process.env.BOT_SLOT_INTERVAL_MINUTES ?? '30', 10);
const parsedBookingDateWindowDays = Number.parseInt(process.env.BOT_BOOKING_DAYS_AHEAD ?? '14', 10);
const WORKING_HOURS_START = Number.isFinite(parsedWorkingHoursStart) ? parsedWorkingHoursStart : 9;
const WORKING_HOURS_END = Number.isFinite(parsedWorkingHoursEnd) ? parsedWorkingHoursEnd : 19;
const SLOT_INTERVAL_MINUTES = Number.isFinite(parsedSlotIntervalMinutes) && parsedSlotIntervalMinutes > 0 ? parsedSlotIntervalMinutes : 30;
const BOOKING_DATE_WINDOW_DAYS = Number.isFinite(parsedBookingDateWindowDays) && parsedBookingDateWindowDays > 0 ? parsedBookingDateWindowDays : 14;

if (!BOT_TOKEN) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN for Telegram bot');
}

if (!ADMIN_CHAT_ID) {
  throw new Error('Missing TELEGRAM_ADMIN_CHAT_ID for Telegram bot');
}

const storage = new SupabaseStorage({
  supabaseUrl: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  tablePrefix: process.env.BOT_SUPABASE_TABLE_PREFIX ?? 'bot_vercel',
});
const telegramBaseUrl = `https://api.telegram.org/bot${BOT_TOKEN}`;

const MENU_TEXT = {
  book: 'Prenotare',
  myBookings: 'Le mie richieste',
  contactAdmin: 'Contattare amministratore',
  newBookings: 'Nuove richieste',
};

const CLIENT_MENU = {
  keyboard: [[{ text: MENU_TEXT.book }], [{ text: MENU_TEXT.myBookings }], [{ text: MENU_TEXT.contactAdmin }]],
  resize_keyboard: true,
};

const ADMIN_MENU = {
  keyboard: [[{ text: MENU_TEXT.newBookings }], [{ text: MENU_TEXT.myBookings }], [{ text: MENU_TEXT.contactAdmin }]],
  resize_keyboard: true,
};

const STATUS_LABELS = {
  pending: 'In attesa di conferma',
  approved: 'Confermata',
  rejected: 'Rifiutata',
  reschedule_requested: 'Serve un nuovo orario',
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;');

const isAdmin = (userId) => ADMIN_IDS.has(String(userId));
const getMenuForUser = (userId) => (isAdmin(userId) ? ADMIN_MENU : CLIENT_MENU);
const getConversationKey = (userId) => String(userId);
const nowIso = () => new Date().toISOString();
const isCalendarBookingEnabled = () => isGoogleCalendarConfigured(process.env);

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('it-IT', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('it-IT', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const FULL_DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const parseDateKeyLocal = (dateKey) => {
  const match = String(dateKey ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
};

const parseMonthKey = (monthKey) => {
  const match = String(monthKey ?? '').match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
};

const formatMonthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

const getMonthKey = (dateKey) => {
  const parsed = parseDateKeyLocal(dateKey);
  return parsed ? formatMonthKey(parsed.year, parsed.month) : null;
};

const buildUtcDateFromKey = (dateKey) => {
  const parsed = parseDateKeyLocal(dateKey);

  if (!parsed) {
    return null;
  }

  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0, 0));
};

const shiftMonthKey = (monthKey, deltaMonths) => {
  const parsed = parseMonthKey(monthKey);

  if (!parsed) {
    return null;
  }

  const shifted = new Date(Date.UTC(parsed.year, parsed.month - 1 + deltaMonths, 1, 12, 0, 0, 0));
  return formatMonthKey(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1);
};

const getCalendarMonths = (dateOptions) => Array.from(new Set(dateOptions.map((dateKey) => getMonthKey(dateKey)).filter(Boolean)));

const formatDateLabel = (dateKey) => {
  const date = buildUtcDateFromKey(dateKey);
  return date ? DATE_LABEL_FORMATTER.format(date) : dateKey;
};

const formatFullDateLabel = (dateKey) => {
  const date = buildUtcDateFromKey(dateKey);
  return date ? FULL_DATE_LABEL_FORMATTER.format(date) : dateKey;
};

const formatMonthLabel = (monthKey) => {
  const parsed = parseMonthKey(monthKey);

  if (!parsed) {
    return monthKey;
  }

  return MONTH_LABEL_FORMATTER.format(new Date(Date.UTC(parsed.year, parsed.month - 1, 1, 12, 0, 0, 0)));
};

const createRows = (items, rowSize) => {
  const rows = [];

  for (let index = 0; index < items.length; index += rowSize) {
    rows.push(items.slice(index, index + rowSize));
  }

  return rows;
};

const buildDateKeyboard = (dateOptions, { visibleMonth, selectedDateKey } = {}) => {
  const selectableDates = new Set(dateOptions);
  const months = getCalendarMonths(dateOptions);
  const activeMonth = months.includes(visibleMonth) ? visibleMonth : getMonthKey(selectedDateKey ?? dateOptions[0]);
  const parsedMonth = parseMonthKey(activeMonth);

  if (!parsedMonth) {
    return {
      inline_keyboard: [[{ text: 'Annulla', callback_data: 'pick_cancel' }]],
    };
  }

  const currentDateKey = listDateOptions({ timeZone: BOOKING_TIME_ZONE, days: 1 })[0];
  const firstDayDate = new Date(Date.UTC(parsedMonth.year, parsedMonth.month - 1, 1, 12, 0, 0, 0));
  const startOffset = (firstDayDate.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(parsedMonth.year, parsedMonth.month, 0, 12, 0, 0, 0)).getUTCDate();
  const cells = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push({ text: ' ', callback_data: 'pick_noop' });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${parsedMonth.year}-${String(parsedMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (!selectableDates.has(dateKey)) {
      cells.push({ text: '\u00b7', callback_data: 'pick_noop' });
      continue;
    }

    let text = String(day);

    if (dateKey === selectedDateKey) {
      text = `\u25cf${day}`;
    } else if (dateKey === currentDateKey) {
      text = `\u25e6${day}`;
    }

    cells.push({ text, callback_data: `pick_date:${dateKey}` });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ text: ' ', callback_data: 'pick_noop' });
  }

  const previousMonth = shiftMonthKey(activeMonth, -1);
  const nextMonth = shiftMonthKey(activeMonth, 1);

  return {
    inline_keyboard: [
      [
        {
          text: months.includes(previousMonth) ? '\u2039' : ' ',
          callback_data: months.includes(previousMonth) ? `pick_month:${previousMonth}` : 'pick_noop',
        },
        {
          text: formatMonthLabel(activeMonth),
          callback_data: 'pick_noop',
        },
        {
          text: months.includes(nextMonth) ? '\u203a' : ' ',
          callback_data: months.includes(nextMonth) ? `pick_month:${nextMonth}` : 'pick_noop',
        },
      ],
      WEEKDAY_LABELS.map((label) => ({ text: label, callback_data: 'pick_noop' })),
      ...createRows(cells, 7),
      [{ text: 'Annulla', callback_data: 'pick_cancel' }],
    ],
  };
};

function buildTimeKeyboard(dateKey, slots) {
  return {
    inline_keyboard: [
      [{ text: formatDateLabel(dateKey), callback_data: 'pick_noop' }],
      ...createRows(
        slots.map((slot) => ({
          text: slot,
          callback_data: `pick_time:${dateKey}|${slot.replace(':', '.')}`,
        })),
        4,
      ),
      [
        { text: '\u2039 Alle date', callback_data: 'pick_back:date' },
        { text: 'Annulla', callback_data: 'pick_cancel' },
      ],
    ],
  };
}

function buildNoSlotsKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '\u2039 Alle date', callback_data: 'pick_back:date' },
        { text: 'Annulla', callback_data: 'pick_cancel' },
      ],
    ],
  };
}


const isCyrillicCodePoint = (codePoint) => codePoint >= 0x0400 && codePoint <= 0x04ff;

const countMojibakeMarkers = (value) => {
  let count = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.codePointAt(index);
    const nextCodePoint = index + 1 < value.length ? value.codePointAt(index + 1) : 0;

    if ((codePoint === 0x0420 || codePoint === 0x0421) && isCyrillicCodePoint(nextCodePoint)) {
      count += 1;
    }

    if ((codePoint === 0x00d0 || codePoint === 0x00d1) && nextCodePoint) {
      count += 1;
    }

    if (codePoint === 0x0432 && nextCodePoint === 0x0402) {
      count += 2;
    }
  }

  return count;
};

const maybeFixMojibake = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const originalMarkerCount = countMojibakeMarkers(value);

  if (originalMarkerCount < 3) {
    return value;
  }

  const fixedValue = Buffer.from(value, 'latin1').toString('utf8');
  const fixedMarkerCount = countMojibakeMarkers(fixedValue);

  return fixedMarkerCount < originalMarkerCount ? fixedValue : value;
};

const normalizeTelegramPayload = (value) => {
  if (typeof value === 'string') {
    return maybeFixMojibake(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeTelegramPayload(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeTelegramPayload(nestedValue)]),
    );
  }

  return value;
};

async function telegramRequest(method, payload = {}) {
  const normalizedPayload = normalizeTelegramPayload(payload);
  const response = await fetch(`${telegramBaseUrl}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(normalizedPayload),
  });

  const text = await response.text();
  let json;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!response.ok || !json?.ok) {
    throw new Error(`Telegram API ${method} failed: ${response.status} ${text}`);
  }

  return json.result;
}

async function sendMessage(chatId, text, extra = {}) {
  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
}

async function answerCallbackQuery(callbackQueryId, text) {
  return telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  });
}

async function editMessage(chatId, messageId, text, extra = {}) {
  return telegramRequest('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    ...extra,
  });
}

async function renderDatePicker({ chatId, conversation, messageId, promptText }) {
  const dateOptions = listDateOptions({
    timeZone: BOOKING_TIME_ZONE,
    days: BOOKING_DATE_WINDOW_DAYS,
  });
  const keyboard = buildDateKeyboard(dateOptions, {
    visibleMonth: conversation?.calendarMonth,
    selectedDateKey: conversation?.draft?.dateKey,
  });
  const text = [
    '<b>Scelta della data</b>',
    conversation?.draft?.service ? `Servizio: ${escapeHtml(conversation.draft.service)}` : '',
    promptText ?? 'Scegli un giorno nel calendario qui sotto.',
  ]
    .filter(Boolean)
    .join('\n');

  if (messageId) {
    return editMessage(chatId, messageId, text, { reply_markup: keyboard });
  }

  return sendMessage(chatId, text, { reply_markup: keyboard });
}

async function renderTimePicker({ chatId, messageId, dateKey }) {
  const slots = await getAvailableSlotsForDate({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    dateKey,
    timeZone: BOOKING_TIME_ZONE,
    durationMinutes: DEFAULT_BOOKING_DURATION_MINUTES,
    slotIntervalMinutes: SLOT_INTERVAL_MINUTES,
    workingHoursStart: WORKING_HOURS_START,
    workingHoursEnd: WORKING_HOURS_END,
  });

  if (slots.length === 0) {
    const text = [
      '<b>Orari disponibili</b>',
      `Per ${escapeHtml(formatFullDateLabel(dateKey))} non ci sono piu slot liberi.`,
      'Scegli un altro giorno.',
    ].join('\n');

    await sendMessage(chatId, text, { reply_markup: buildNoSlotsKeyboard() });

    return false;
  }

  const text = [
    '<b>Orari disponibili</b>',
    `Data: ${escapeHtml(formatFullDateLabel(dateKey))}`,
    'Scegli uno slot comodo.',
  ].join('\n');

  await sendMessage(chatId, text, { reply_markup: buildTimeKeyboard(dateKey, slots) });

  return true;
}

async function setConversation(userId, state) {
  await storage.update((data) => {
    data.conversations[getConversationKey(userId)] = state;
    return data;
  });
}

async function clearConversation(userId) {
  await storage.update((data) => {
    delete data.conversations[getConversationKey(userId)];
    return data;
  });
}

async function getConversation(userId) {
  const data = await storage.read();
  return data.conversations[getConversationKey(userId)];
}

async function createBooking({ user, service, preferredDateTime, notes }) {
  const createdAt = nowIso();
  let createdBooking;

  await storage.update((data) => {
    createdBooking = {
      id: data.meta.nextBookingId,
      telegramUserId: String(user.id),
      role: isAdmin(user.id) ? 'admin' : 'client',
      service,
      preferredDateTime,
      status: 'pending',
      adminMessageId: null,
      notes: notes ?? '',
      calendarEventId: null,
      clientName: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Cliente',
      username: user.username ?? null,
      createdAt,
      updatedAt: createdAt,
    };

    data.meta.nextBookingId += 1;
    data.bookings.unshift(createdBooking);
    return data;
  });

  return createdBooking;
}

async function updateBooking(bookingId, updater) {
  let updatedBooking = null;

  await storage.update((data) => {
    data.bookings = data.bookings.map((booking) => {
      if (booking.id !== bookingId) {
        return booking;
      }

      updatedBooking = {
        ...booking,
        ...updater(booking),
        updatedAt: nowIso(),
      };

      return updatedBooking;
    });

    return data;
  });

  return updatedBooking;
}

async function getBooking(bookingId) {
  const data = await storage.read();
  return data.bookings.find((booking) => booking.id === bookingId) ?? null;
}

async function listBookingsByUser(userId) {
  const data = await storage.read();
  return data.bookings.filter((booking) => booking.telegramUserId === String(userId));
}

async function listPendingBookings() {
  const data = await storage.read();
  return data.bookings.filter((booking) => booking.status === 'pending');
}

function buildAdminKeyboard(bookingId) {
  return {
    inline_keyboard: [
      [
        { text: 'Confermare', callback_data: `booking:${bookingId}:approve` },
        { text: 'Rifiutare', callback_data: `booking:${bookingId}:reject` },
      ],
      [{ text: 'Proporre un altro orario', callback_data: `booking:${bookingId}:reschedule` }],
    ],
  };
}

function formatBookingSummary(booking) {
  const usernameLine = booking.username ? `\nUsername: @${escapeHtml(booking.username)}` : '';
  const notesLine = booking.notes ? `\nCommento: ${escapeHtml(booking.notes)}` : '';

  return [
    `<b>Richiesta #${booking.id}</b>`,
    `Cliente: ${escapeHtml(booking.clientName)}`,
    `Servizio: ${escapeHtml(booking.service)}`,
    `Orario richiesto: ${escapeHtml(booking.preferredDateTime)}`,
    `Stato: ${escapeHtml(STATUS_LABELS[booking.status] ?? booking.status)}`,
    usernameLine,
    notesLine,
  ]
    .filter(Boolean)
    .join('\n');
}

async function notifyAdminsAboutBooking(booking) {
  const result = await sendMessage(ADMIN_CHAT_ID, `${formatBookingSummary(booking)}\n\nScegli un'azione qui sotto:`, {
    reply_markup: buildAdminKeyboard(booking.id),
  });

  await updateBooking(booking.id, () => ({
    adminMessageId: result.message_id,
  }));
}

async function showMainMenu(chatId, userId, introText = "Scegli un'azione:") {
  await sendMessage(chatId, introText, {
    reply_markup: getMenuForUser(userId),
  });
}

async function handleStart(message) {
  await clearConversation(message.from.id);
  await showMainMenu(
    message.chat.id,
    message.from.id,
    isAdmin(message.from.id)
      ? 'Menu amministratore pronto.'
      : 'Benvenuta. Qui puoi lasciare una richiesta di appuntamento o contattare l\'amministratore.',
  );
}

async function handleBookingsList(message) {
  const bookings = await listBookingsByUser(message.from.id);

  if (bookings.length === 0) {
    await sendMessage(message.chat.id, 'Non hai ancora richieste.', {
      reply_markup: getMenuForUser(message.from.id),
    });
    return;
  }

  const text = bookings
    .slice(0, 10)
    .map(
      (booking) =>
        `#${booking.id} - ${booking.service} - ${booking.preferredDateTime} - ${STATUS_LABELS[booking.status] ?? booking.status}`,
    )
    .join('\n');

  await sendMessage(message.chat.id, `<b>Le tue richieste</b>\n${escapeHtml(text)}`, {
    reply_markup: getMenuForUser(message.from.id),
  });
}

async function handlePendingBookings(message) {
  if (!isAdmin(message.from.id)) {
    await sendMessage(message.chat.id, 'Questo comando e disponibile solo per gli amministratori.');
    return;
  }

  const bookings = await listPendingBookings();

  if (bookings.length === 0) {
    await sendMessage(message.chat.id, 'Al momento non ci sono nuove richieste.', {
      reply_markup: getMenuForUser(message.from.id),
    });
    return;
  }

  const text = bookings
    .slice(0, 10)
    .map((booking) => `#${booking.id} - ${booking.clientName} - ${booking.service} - ${booking.preferredDateTime}`)
    .join('\n');

  await sendMessage(message.chat.id, `<b>Nuove richieste</b>\n${escapeHtml(text)}`, {
    reply_markup: getMenuForUser(message.from.id),
  });
}

async function beginBookingFlow(message) {
  const conversation = {
    type: 'booking',
    step: isCalendarBookingEnabled() ? 'date' : 'service',
    draft: {},
  };

  await setConversation(message.from.id, conversation);

  if (isCalendarBookingEnabled()) {
    await renderDatePicker({
      chatId: message.chat.id,
      conversation,
      promptText: 'Scegli la data dell\'appuntamento.',
    });
    return;
  }

  await sendMessage(message.chat.id, 'Scrivi, per favore, il servizio che ti interessa.', {
    reply_markup: getMenuForUser(message.from.id),
  });
}

async function beginAdminContactFlow(message) {
  await setConversation(message.from.id, {
    type: 'contact_admin',
    step: 'message',
  });

  await sendMessage(
    message.chat.id,
    'Scrivi un messaggio per l\'amministratore. Lo inoltrero subito al gruppo admin.',
    { reply_markup: getMenuForUser(message.from.id) },
  );
}

async function handleConversation(message, conversation) {
  if (conversation.type === 'booking' && conversation.step === 'service') {
    const nextConversation = {
      ...conversation,
      draft: {
        ...conversation.draft,
        service: message.text.trim(),
      },
    };

    if (isCalendarBookingEnabled()) {
      await setConversation(message.from.id, {
        ...nextConversation,
        step: 'date',
      });
      await renderDatePicker({
        chatId: message.chat.id,
        conversation: { ...nextConversation, step: 'date' },
        promptText: 'Perfetto. Ora scegli la data dell\'appuntamento.',
      });
      return true;
    }

    await setConversation(message.from.id, {
      ...nextConversation,
      step: 'preferredDateTimeText',
    });
    await sendMessage(message.chat.id, 'Indica la data e l\'ora desiderate nel formato YYYY-MM-DD HH:mm. Esempio: 2026-03-25 14:30');
    return true;
  }

  if (conversation.type === 'booking' && conversation.step === 'serviceAfterTime') {
    await setConversation(message.from.id, {
      ...conversation,
      step: 'notes',
      draft: {
        ...conversation.draft,
        service: message.text.trim(),
      },
    });

    await sendMessage(message.chat.id, 'Aggiungi un commento oppure invia "-" se non hai commenti.');
    return true;
  }

  if (conversation.type === 'booking' && conversation.step === 'preferredDateTimeText') {
    await setConversation(message.from.id, {
      ...conversation,
      step: 'notes',
      draft: {
        ...conversation.draft,
        preferredDateTime: message.text.trim(),
      },
    });

    await sendMessage(message.chat.id, 'Aggiungi un commento oppure invia "-" se non hai commenti.');
    return true;
  }

  if (conversation.type === 'booking' && conversation.step === 'notes') {
    const draft = {
      ...conversation.draft,
      notes: message.text.trim() === '-' ? '' : message.text.trim(),
    };

    const booking = await createBooking({
      user: message.from,
      service: draft.service,
      preferredDateTime: draft.preferredDateTime,
      notes: draft.notes,
    });

    await clearConversation(message.from.id);
    try {
      await notifyAdminsAboutBooking(booking);
    } catch (error) {
      console.error('[telegram-bot] Failed to notify admins about booking', {
        bookingId: booking.id,
        error: error instanceof Error ? error.message : error,
      });
    }
    await sendMessage(
      message.chat.id,
      `Richiesta #${booking.id} creata. L'abbiamo inviata agli amministratori e ti avviseremo dopo la conferma.`,
      { reply_markup: getMenuForUser(message.from.id) },
    );
    return true;
  }

  if (conversation.type === 'contact_admin' && conversation.step === 'message') {
    const senderName =
      [message.from.first_name, message.from.last_name].filter(Boolean).join(' ') ||
      message.from.username ||
      `User ${message.from.id}`;

    await sendMessage(
      ADMIN_CHAT_ID,
      `<b>Messaggio del cliente</b>\nDa: ${escapeHtml(senderName)}\nTelegram ID: <code>${escapeHtml(message.from.id)}</code>\n\n${escapeHtml(message.text.trim())}`,
    );

    await clearConversation(message.from.id);
    await sendMessage(message.chat.id, 'Messaggio inviato agli amministratori. Ti risponderanno in questo bot.', {
      reply_markup: getMenuForUser(message.from.id),
    });
    return true;
  }

  if (conversation.type === 'admin_reschedule' && conversation.bookingId) {
    if (!isAdmin(message.from.id)) {
      await clearConversation(message.from.id);
      return true;
    }

    const booking = await updateBooking(conversation.bookingId, () => ({
      status: 'reschedule_requested',
      notes: message.text.trim(),
    }));

    await clearConversation(message.from.id);

    if (booking) {
      await sendMessage(
        booking.telegramUserId,
        `Per la richiesta #${booking.id} l'amministratore ha proposto un altro orario.\n\nCommento: ${escapeHtml(message.text.trim())}`,
      );
      await sendMessage(message.chat.id, `Cliente avvisato per la richiesta #${booking.id}.`, {
        reply_markup: getMenuForUser(message.from.id),
      });
    }

    return true;
  }

  return false;
}

async function handleBookingPickerCallback(callbackQuery) {
  const actorId = callbackQuery.from?.id;
  const message = callbackQuery.message;
  const data = String(callbackQuery.data ?? '');

  if (!actorId || !message) {
    return false;
  }

  const conversation = await getConversation(actorId);

  if (data === 'pick_noop') {
    await answerCallbackQuery(callbackQuery.id, '');
    return true;
  }

  if (data === 'pick_cancel') {
    await clearConversation(actorId);
    await answerCallbackQuery(callbackQuery.id, 'Prenotazione annullata');
    await showMainMenu(message.chat.id, actorId, 'Prenotazione annullata. Scegli un\'azione:');
    return true;
  }

  if (!conversation || conversation.type !== 'booking') {
    await answerCallbackQuery(callbackQuery.id, 'Sessione di prenotazione non trovata');
    await sendMessage(
      message.chat.id,
      `La sessione di prenotazione e scaduta. Premi "${MENU_TEXT.book}" e ricomincia.`,
      { reply_markup: getMenuForUser(actorId) },
    );
    return true;
  }

  if (data.startsWith('pick_month:')) {
    const nextMonth = data.slice('pick_month:'.length);
    const nextConversation = {
      ...conversation,
      calendarMonth: nextMonth,
    };
    await setConversation(actorId, nextConversation);
    await answerCallbackQuery(callbackQuery.id, 'Mese aggiornato');
    await renderDatePicker({
      chatId: message.chat.id,
      conversation: nextConversation,
      messageId: message.message_id,
    });
    return true;
  }

  if (data === 'pick_back:date') {
    const nextConversation = {
      ...conversation,
      step: 'date',
    };
    await setConversation(actorId, nextConversation);
    await answerCallbackQuery(callbackQuery.id, 'Scegli un altro giorno');
    await renderDatePicker({
      chatId: message.chat.id,
      conversation: nextConversation,
      messageId: message.message_id,
      promptText: 'Scegli una nuova data per l\'appuntamento.',
    });
    return true;
  }

  if (data.startsWith('pick_date:')) {
    const dateKey = data.slice('pick_date:'.length);
    console.info('[telegram-bot] Date selected', {
      actorId,
      chatId: message.chat.id,
      dateKey,
      conversationStep: conversation.step,
    });
    const nextConversation = {
      ...conversation,
      step: 'time',
      calendarMonth: getMonthKey(dateKey),
      draft: {
        ...conversation.draft,
        dateKey,
      },
    };

    await setConversation(actorId, nextConversation);
    await answerCallbackQuery(callbackQuery.id, 'Carico gli orari disponibili...');

    try {
      await renderTimePicker({
        chatId: message.chat.id,
        messageId: message.message_id,
        dateKey,
      });
    } catch (error) {
      console.error('[telegram-bot] Failed to fetch Google Calendar slots', error);
      await sendMessage(
        message.chat.id,
        'Non sono riuscito a caricare gli orari liberi da Google Calendar. Riprova tra poco.',
        { reply_markup: getMenuForUser(actorId) },
      );
    }
    return true;
  }

  if (data.startsWith('pick_time:')) {
    const payload = data.slice('pick_time:'.length);
    const [dateKey, rawTime] = payload.split('|');
    const timeKey = rawTime?.replace('.', ':');

    if (!dateKey || !timeKey) {
      await answerCallbackQuery(callbackQuery.id, 'Slot non valido');
      return true;
    }

    await setConversation(actorId, {
      ...conversation,
      step: conversation.draft?.service ? 'notes' : 'serviceAfterTime',
      calendarMonth: getMonthKey(dateKey),
      draft: {
        ...conversation.draft,
        dateKey,
        preferredDateTime: `${dateKey} ${timeKey}`,
      },
    });

    await answerCallbackQuery(callbackQuery.id, 'Orario selezionato');
    if (!conversation.draft?.service) {
      await sendMessage(message.chat.id, 'Scrivi, per favore, il servizio che ti interessa.', {
        reply_markup: getMenuForUser(actorId),
      });
      return true;
    }

    await sendMessage(
      message.chat.id,
      `Hai scelto ${escapeHtml(`${dateKey} ${timeKey}`)}. Aggiungi un commento oppure invia "-" se non hai commenti.`,
      { reply_markup: getMenuForUser(actorId) },
    );
    return true;
  }

  return false;
}


async function handleClientCommand(message) {
  const text = message.text.trim();

  if (text === '/start' || text === '/menu') {
    await handleStart(message);
    return;
  }

  if (text === MENU_TEXT.book) {
    await beginBookingFlow(message);
    return;
  }

  if (text === MENU_TEXT.myBookings) {
    await handleBookingsList(message);
    return;
  }

  if (text === MENU_TEXT.contactAdmin) {
    await beginAdminContactFlow(message);
    return;
  }

  if (text === MENU_TEXT.newBookings) {
    await handlePendingBookings(message);
    return;
  }

  await showMainMenu(message.chat.id, message.from.id, 'Non ho capito il comando. Scegli un\'azione dal menu.');
}

async function handleCallbackQuery(callbackQuery) {
  const data = String(callbackQuery.data ?? '');

  if (data.startsWith('pick_')) {
    const handled = await handleBookingPickerCallback(callbackQuery);
    if (handled) {
      return;
    }
  }

  const actorId = callbackQuery.from?.id;

  if (!actorId || !isAdmin(actorId)) {
    await answerCallbackQuery(callbackQuery.id, 'Permessi insufficienti');
    return;
  }

  const [entity, rawBookingId, action] = data.split(':');

  if (entity !== 'booking' || !rawBookingId || !action) {
    await answerCallbackQuery(callbackQuery.id, 'Azione sconosciuta');
    return;
  }

  const bookingId = Number(rawBookingId);
  const booking = await getBooking(bookingId);

  if (!booking) {
    await answerCallbackQuery(callbackQuery.id, 'Richiesta non trovata');
    return;
  }

  if (action === 'approve') {
    if (!isCalendarBookingEnabled()) {
      await answerCallbackQuery(callbackQuery.id, 'Google Calendar non configurato');
      await sendMessage(
        callbackQuery.message.chat.id,
        'Impossibile confermare la richiesta: compila GOOGLE_CALENDAR_ID e GOOGLE_SERVICE_ACCOUNT_JSON in bot/.env.',
        { reply_markup: getMenuForUser(actorId) },
      );
      return;
    }

    const startDate = parseBookingDateTime(booking.preferredDateTime, BOOKING_TIME_ZONE);

    if (!startDate) {
      await answerCallbackQuery(callbackQuery.id, 'Formato data non valido');
      await sendMessage(
        callbackQuery.message.chat.id,
        `Impossibile creare l'evento in Google Calendar per la richiesta #${booking.id}. L'orario scelto ha un formato non valido.`,
        { reply_markup: getMenuForUser(actorId) },
      );
      return;
    }

    try {
      const calendarEvent = await createCalendarEvent({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        summary: `${booking.service} - ${booking.clientName}`,
        description: [
          `Booking #${booking.id}`,
          `Client: ${booking.clientName}`,
          booking.username ? `Telegram: @${booking.username}` : `Telegram ID: ${booking.telegramUserId}`,
          `Requested time: ${booking.preferredDateTime}`,
          booking.notes ? `Notes: ${booking.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        startDate,
        durationMinutes: DEFAULT_BOOKING_DURATION_MINUTES,
        timeZone: BOOKING_TIME_ZONE,
      });

      const updatedBooking = await updateBooking(bookingId, () => ({
        status: 'approved',
        calendarEventId: calendarEvent.id,
      }));

      await sendMessage(
        updatedBooking.telegramUserId,
        `La tua richiesta #${updatedBooking.id} e confermata.\nServizio: ${escapeHtml(updatedBooking.service)}\nOrario: ${escapeHtml(updatedBooking.preferredDateTime)}`,
      );
      await answerCallbackQuery(callbackQuery.id, 'Calendario aggiornato, cliente avvisato');
      return;
    } catch (error) {
      console.error('[telegram-bot] Failed to create Google Calendar event', error);
      await answerCallbackQuery(callbackQuery.id, 'Impossibile creare l\'evento');
      await sendMessage(
        callbackQuery.message.chat.id,
        `Impossibile creare l'evento in Google Calendar per la richiesta #${booking.id}. ${escapeHtml(error instanceof Error ? error.message : 'Unknown error')}`,
        { reply_markup: getMenuForUser(actorId) },
      );
      return;
    }
  }

  if (action === 'reject') {
    const updatedBooking = await updateBooking(bookingId, () => ({ status: 'rejected' }));
    await sendMessage(
      updatedBooking.telegramUserId,
      `La tua richiesta #${updatedBooking.id} al momento non puo essere confermata. Scegli un altro orario oppure scrivici di nuovo.`,
    );
    await answerCallbackQuery(callbackQuery.id, 'Richiesta rifiutata');
    return;
  }

  if (action === 'reschedule') {
    await setConversation(actorId, {
      type: 'admin_reschedule',
      bookingId,
    });
    await sendMessage(
      callbackQuery.message.chat.id,
      `Scrivi un messaggio per il cliente della richiesta #${bookingId}: proponi un altro orario o chiarisci i dettagli.`,
      { reply_markup: getMenuForUser(actorId) },
    );
    await answerCallbackQuery(callbackQuery.id, 'Attendo il testo per il cliente');
    return;
  }

  await answerCallbackQuery(callbackQuery.id, 'Azione sconosciuta');
}

async function handleMessage(message) {
  if (!message?.from || !message?.text) {
    return;
  }

  const text = message.text.trim();
  const resetsConversation =
    text === '/start' ||
    text === '/menu' ||
    text === MENU_TEXT.book ||
    text === MENU_TEXT.myBookings ||
    text === MENU_TEXT.contactAdmin ||
    text === MENU_TEXT.newBookings ||
    text === MENU_TEXT.book ||
    text === MENU_TEXT.myBookings ||
    text === MENU_TEXT.contactAdmin ||
    text === MENU_TEXT.newBookings;

  if (resetsConversation) {
    await handleClientCommand(message);
    return;
  }

  const conversation = await getConversation(message.from.id);

  if (conversation) {
    const wasHandled = await handleConversation(message, conversation);
    if (wasHandled) {
      return;
    }
  }

  await handleClientCommand(message);
}

export async function processUpdate(update) {
  if (update.message) {
    await handleMessage(update.message);
  }

  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  }
}

export async function processWebhookUpdate(update) {
  const shouldProcess = await storage.markUpdateProcessed(update?.update_id);

  if (!shouldProcess) {
    return {
      processed: false,
      duplicate: true,
    };
  }

  try {
    await processUpdate(update);
  } catch (error) {
    await storage.forgetProcessedUpdate(update?.update_id);
    throw error;
  }

  return {
    processed: true,
    duplicate: false,
  };
}
