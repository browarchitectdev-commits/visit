import process from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JsonStorage } from './storage.mjs';
import {
  createCalendarEvent,
  getAvailableSlotsForDate,
  isGoogleCalendarConfigured,
  listDateOptions,
  parseBookingDateTime,
} from './google-calendar.mjs';

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      continue;
    }

    if (value === '{') {
      const jsonLines = ['{'];

      while (index + 1 < lines.length) {
        index += 1;
        jsonLines.push(lines[index]);

        if (lines[index].trim() === '}') {
          break;
        }
      }

      value = jsonLines.join('\n');
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
};

loadEnvFile(resolve(process.cwd(), 'bot/.env'));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const ADMIN_IDS = new Set(
  (process.env.TELEGRAM_ADMIN_IDS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
);
const STORAGE_PATH = process.env.BOT_STORAGE_PATH ?? './bot/data/bookings.json';
const POLL_TIMEOUT_SECONDS = 25;
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

const storage = new JsonStorage(STORAGE_PATH);
const telegramBaseUrl = `https://api.telegram.org/bot${BOT_TOKEN}`;

const CLIENT_MENU = {
  keyboard: [[{ text: 'Записаться' }], [{ text: 'Мои заявки' }], [{ text: 'Связаться с администратором' }]],
  resize_keyboard: true,
};

const ADMIN_MENU = {
  keyboard: [[{ text: 'Новые заявки' }], [{ text: 'Мои заявки' }], [{ text: 'Связаться с администратором' }]],
  resize_keyboard: true,
};

const STATUS_LABELS = {
  pending: 'Ожидает подтверждения',
  approved: 'Подтверждена',
  rejected: 'Отклонена',
  reschedule_requested: 'Нужно новое время',
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

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const FULL_DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

const WEEKDAY_LABELS = ['\u041f\u043d', '\u0412\u0442', '\u0421\u0440', '\u0427\u0442', '\u041f\u0442', '\u0421\u0431', '\u0412\u0441'];

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
      inline_keyboard: [[{ text: '\u041e\u0442\u043c\u0435\u043d\u0430', callback_data: 'pick_cancel' }]],
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
      [{ text: '\u041e\u0442\u043c\u0435\u043d\u0430', callback_data: 'pick_cancel' }],
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
        { text: '\u2039 \u041a \u0434\u0430\u0442\u0430\u043c', callback_data: 'pick_back:date' },
        { text: '\u041e\u0442\u043c\u0435\u043d\u0430', callback_data: 'pick_cancel' },
      ],
    ],
  };
}

function buildNoSlotsKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '\u2039 \u041a \u0434\u0430\u0442\u0430\u043c', callback_data: 'pick_back:date' },
        { text: '\u041e\u0442\u043c\u0435\u043d\u0430', callback_data: 'pick_cancel' },
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
    '<b>\u0412\u044b\u0431\u043e\u0440 \u0434\u0430\u0442\u044b</b>',
    conversation?.draft?.service ? `\u0423\u0441\u043b\u0443\u0433\u0430: ${escapeHtml(conversation.draft.service)}` : '',
    promptText ?? '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0435\u043d\u044c \u0432 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0435 \u043d\u0438\u0436\u0435.',
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
      '<b>\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f</b>',
      `\u041d\u0430 ${escapeHtml(formatFullDateLabel(dateKey))} \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u044b\u0445 \u0441\u043b\u043e\u0442\u043e\u0432 \u043d\u0435 \u043e\u0441\u0442\u0430\u043b\u043e\u0441\u044c.`,
      '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u043e\u0439 \u0434\u0435\u043d\u044c.',
    ].join('\n');

    if (messageId) {
      await editMessage(chatId, messageId, text, { reply_markup: buildNoSlotsKeyboard() });
    } else {
      await sendMessage(chatId, text, { reply_markup: buildNoSlotsKeyboard() });
    }

    return false;
  }

  const text = [
    '<b>\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f</b>',
    `\u0414\u0430\u0442\u0430: ${escapeHtml(formatFullDateLabel(dateKey))}`,
    '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0434\u043e\u0431\u043d\u044b\u0439 \u0441\u043b\u043e\u0442.',
  ].join('\n');

  if (messageId) {
    await editMessage(chatId, messageId, text, { reply_markup: buildTimeKeyboard(dateKey, slots) });
  } else {
    await sendMessage(chatId, text, { reply_markup: buildTimeKeyboard(dateKey, slots) });
  }

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
        { text: 'Подтвердить', callback_data: `booking:${bookingId}:approve` },
        { text: 'Отклонить', callback_data: `booking:${bookingId}:reject` },
      ],
      [{ text: 'Предложить другое время', callback_data: `booking:${bookingId}:reschedule` }],
    ],
  };
}

function formatBookingSummary(booking) {
  const usernameLine = booking.username ? `\nUsername: @${escapeHtml(booking.username)}` : '';
  const notesLine = booking.notes ? `\nКомментарий: ${escapeHtml(booking.notes)}` : '';

  return [
    `<b>Заявка #${booking.id}</b>`,
    `Клиент: ${escapeHtml(booking.clientName)}`,
    `Услуга: ${escapeHtml(booking.service)}`,
    `Желаемое время: ${escapeHtml(booking.preferredDateTime)}`,
    `Статус: ${escapeHtml(STATUS_LABELS[booking.status] ?? booking.status)}`,
    usernameLine,
    notesLine,
  ]
    .filter(Boolean)
    .join('\n');
}

async function notifyAdminsAboutBooking(booking) {
  const result = await sendMessage(ADMIN_CHAT_ID, `${formatBookingSummary(booking)}\n\nВыберите действие ниже:`, {
    reply_markup: buildAdminKeyboard(booking.id),
  });

  await updateBooking(booking.id, () => ({
    adminMessageId: result.message_id,
  }));
}

async function showMainMenu(chatId, userId, introText = 'Выберите действие:') {
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
      ? 'Меню администратора готово.'
      : 'Добро пожаловать. Здесь можно оставить заявку на запись или связаться с администратором.',
  );
}

async function handleBookingsList(message) {
  const bookings = await listBookingsByUser(message.from.id);

  if (bookings.length === 0) {
    await sendMessage(message.chat.id, 'У вас пока нет заявок.', {
      reply_markup: getMenuForUser(message.from.id),
    });
    return;
  }

  const text = bookings
    .slice(0, 10)
    .map(
      (booking) =>
        `#${booking.id} • ${booking.service} • ${booking.preferredDateTime} • ${STATUS_LABELS[booking.status] ?? booking.status}`,
    )
    .join('\n');

  await sendMessage(message.chat.id, `<b>Ваши заявки</b>\n${escapeHtml(text)}`, {
    reply_markup: getMenuForUser(message.from.id),
  });
}

async function handlePendingBookings(message) {
  if (!isAdmin(message.from.id)) {
    await sendMessage(message.chat.id, 'Эта команда доступна только администраторам.');
    return;
  }

  const bookings = await listPendingBookings();

  if (bookings.length === 0) {
    await sendMessage(message.chat.id, 'Сейчас нет новых заявок.', {
      reply_markup: getMenuForUser(message.from.id),
    });
    return;
  }

  const text = bookings
    .slice(0, 10)
    .map((booking) => `#${booking.id} • ${booking.clientName} • ${booking.service} • ${booking.preferredDateTime}`)
    .join('\n');

  await sendMessage(message.chat.id, `<b>Новые заявки</b>\n${escapeHtml(text)}`, {
    reply_markup: getMenuForUser(message.from.id),
  });
}

async function beginBookingFlow(message) {
  await setConversation(message.from.id, {
    type: 'booking',
    step: 'service',
    draft: {},
  });

  await sendMessage(message.chat.id, 'Напишите, пожалуйста, услугу, которая вас интересует.', {
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
    'Напишите одно сообщение для администратора. Я сразу перешлю его в админскую группу.',
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
        promptText: 'Отлично. Теперь выберите дату записи.',
      });
      return true;
    }

    await setConversation(message.from.id, {
      ...nextConversation,
      step: 'preferredDateTimeText',
    });
    await sendMessage(message.chat.id, 'Укажите желаемую дату и время в формате YYYY-MM-DD HH:mm. Например: 2026-03-25 14:30');
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

    await sendMessage(message.chat.id, 'Добавьте комментарий или отправьте "-" если комментария нет.');
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
    await notifyAdminsAboutBooking(booking);
    await sendMessage(
      message.chat.id,
      `Заявка #${booking.id} создана. Мы отправили её администраторам и сообщим вам после подтверждения.`,
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
      `<b>Сообщение клиента</b>\nОт: ${escapeHtml(senderName)}\nTelegram ID: <code>${escapeHtml(message.from.id)}</code>\n\n${escapeHtml(message.text.trim())}`,
    );

    await clearConversation(message.from.id);
    await sendMessage(message.chat.id, 'Сообщение отправлено администраторам. Вам ответят в этом боте.', {
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
        `По заявке #${booking.id} администратор предложил другое время.\n\nКомментарий: ${escapeHtml(message.text.trim())}`,
      );
      await sendMessage(message.chat.id, `Клиент уведомлён по заявке #${booking.id}.`, {
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
    await answerCallbackQuery(callbackQuery.id, '\u0417\u0430\u043f\u0438\u0441\u044c \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430');
    await showMainMenu(message.chat.id, actorId, '\u0417\u0430\u043f\u0438\u0441\u044c \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430. \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435:');
    return true;
  }

  if (!conversation || conversation.type !== 'booking') {
    await answerCallbackQuery(callbackQuery.id, '\u0421\u0435\u0441\u0441\u0438\u044f \u0437\u0430\u043f\u0438\u0441\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430');
    return true;
  }

  if (data.startsWith('pick_month:')) {
    const nextMonth = data.slice('pick_month:'.length);
    const nextConversation = {
      ...conversation,
      calendarMonth: nextMonth,
    };
    await setConversation(actorId, nextConversation);
    await answerCallbackQuery(callbackQuery.id, '\u041c\u0435\u0441\u044f\u0446 \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d');
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
    await answerCallbackQuery(callbackQuery.id, '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u043e\u0439 \u0434\u0435\u043d\u044c');
    await renderDatePicker({
      chatId: message.chat.id,
      conversation: nextConversation,
      messageId: message.message_id,
      promptText: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043d\u043e\u0432\u0443\u044e \u0434\u0430\u0442\u0443 \u0437\u0430\u043f\u0438\u0441\u0438.',
    });
    return true;
  }

  if (data.startsWith('pick_date:')) {
    const dateKey = data.slice('pick_date:'.length);
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

    try {
      const hasSlots = await renderTimePicker({
        chatId: message.chat.id,
        messageId: message.message_id,
        dateKey,
      });
      await answerCallbackQuery(callbackQuery.id, hasSlots ? '\u0414\u0430\u0442\u0430 \u0432\u044b\u0431\u0440\u0430\u043d\u0430' : '\u0412\u0441\u0435 \u0441\u043b\u043e\u0442\u044b \u0437\u0430\u043d\u044f\u0442\u044b');
    } catch (error) {
      console.error('[telegram-bot] Failed to fetch Google Calendar slots', error);
      await answerCallbackQuery(callbackQuery.id, '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u043b\u043e\u0442\u044b');
      await sendMessage(
        message.chat.id,
        '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u0438\u0437 Google Calendar. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u0447\u0443\u0442\u044c \u043f\u043e\u0437\u0436\u0435.',
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
      await answerCallbackQuery(callbackQuery.id, '\u041d\u0435\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 \u0441\u043b\u043e\u0442');
      return true;
    }

    await setConversation(actorId, {
      ...conversation,
      step: 'notes',
      calendarMonth: getMonthKey(dateKey),
      draft: {
        ...conversation.draft,
        dateKey,
        preferredDateTime: `${dateKey} ${timeKey}`,
      },
    });

    await answerCallbackQuery(callbackQuery.id, '\u0412\u0440\u0435\u043c\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043e');
    await sendMessage(
      message.chat.id,
      `\u0412\u044b \u0432\u044b\u0431\u0440\u0430\u043b\u0438 ${escapeHtml(`${dateKey} ${timeKey}`)}. \u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 \u0438\u043b\u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435 "-" \u0435\u0441\u043b\u0438 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u044f \u043d\u0435\u0442.`,
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

  if (text === 'Записаться') {
    await beginBookingFlow(message);
    return;
  }

  if (text === 'Мои заявки') {
    await handleBookingsList(message);
    return;
  }

  if (text === 'Связаться с администратором') {
    await beginAdminContactFlow(message);
    return;
  }

  if (text === 'Новые заявки') {
    await handlePendingBookings(message);
    return;
  }

  await showMainMenu(message.chat.id, message.from.id, 'Не понял команду. Выберите действие из меню.');
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
    await answerCallbackQuery(callbackQuery.id, 'Недостаточно прав');
    return;
  }

  const [entity, rawBookingId, action] = data.split(':');

  if (entity !== 'booking' || !rawBookingId || !action) {
    await answerCallbackQuery(callbackQuery.id, 'Неизвестное действие');
    return;
  }

  const bookingId = Number(rawBookingId);
  const booking = await getBooking(bookingId);

  if (!booking) {
    await answerCallbackQuery(callbackQuery.id, 'Заявка не найдена');
    return;
  }

  if (action === 'approve') {
    if (!isCalendarBookingEnabled()) {
      await answerCallbackQuery(callbackQuery.id, 'Google Calendar не настроен');
      await sendMessage(
        callbackQuery.message.chat.id,
        'Не удалось подтвердить заявку: заполните GOOGLE_CALENDAR_ID и GOOGLE_SERVICE_ACCOUNT_JSON в bot/.env.',
        { reply_markup: getMenuForUser(actorId) },
      );
      return;
    }

    const startDate = parseBookingDateTime(booking.preferredDateTime, BOOKING_TIME_ZONE);

    if (!startDate) {
      await answerCallbackQuery(callbackQuery.id, 'Неверный формат даты');
      await sendMessage(
        callbackQuery.message.chat.id,
        `Не удалось создать запись в Google Calendar для заявки #${booking.id}. Выбранное время имеет некорректный формат.`,
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
        `Ваша заявка #${updatedBooking.id} подтверждена.\nУслуга: ${escapeHtml(updatedBooking.service)}\nВремя: ${escapeHtml(updatedBooking.preferredDateTime)}`,
      );
      await answerCallbackQuery(callbackQuery.id, 'Календарь обновлён, клиент уведомлён');
      return;
    } catch (error) {
      console.error('[telegram-bot] Failed to create Google Calendar event', error);
      await answerCallbackQuery(callbackQuery.id, 'Не удалось создать событие');
      await sendMessage(
        callbackQuery.message.chat.id,
        `Не удалось создать событие в Google Calendar для заявки #${booking.id}. ${escapeHtml(error instanceof Error ? error.message : 'Unknown error')}`,
        { reply_markup: getMenuForUser(actorId) },
      );
      return;
    }
  }

  if (action === 'reject') {
    const updatedBooking = await updateBooking(bookingId, () => ({ status: 'rejected' }));
    await sendMessage(
      updatedBooking.telegramUserId,
      `Ваша заявка #${updatedBooking.id} пока не может быть подтверждена. Пожалуйста, выберите другое время или напишите нам снова.`,
    );
    await answerCallbackQuery(callbackQuery.id, 'Заявка отклонена');
    return;
  }

  if (action === 'reschedule') {
    await setConversation(actorId, {
      type: 'admin_reschedule',
      bookingId,
    });
    await sendMessage(
      callbackQuery.message.chat.id,
      `Напишите сообщение для клиента по заявке #${bookingId}: предложите другое время или уточните детали.`,
      { reply_markup: getMenuForUser(actorId) },
    );
    await answerCallbackQuery(callbackQuery.id, 'Ожидаю текст для клиента');
    return;
  }

  await answerCallbackQuery(callbackQuery.id, 'Неизвестное действие');
}

async function handleMessage(message) {
  if (!message?.from || !message?.text) {
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

async function processUpdate(update) {
  if (update.message) {
    await handleMessage(update.message);
  }

  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  }
}

async function poll(offset) {
  const result = await telegramRequest('getUpdates', {
    offset,
    timeout: POLL_TIMEOUT_SECONDS,
    allowed_updates: ['message', 'callback_query'],
  });

  return Array.isArray(result) ? result : [];
}

async function main() {
  console.info('[telegram-bot] Starting long polling bot');
  let offset = 0;

  while (true) {
    try {
      const updates = await poll(offset);

      for (const update of updates) {
        offset = update.update_id + 1;
        await processUpdate(update);
      }
    } catch (error) {
      console.error('[telegram-bot] Polling error', error);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 3000));
    }
  }
}

main().catch((error) => {
  console.error('[telegram-bot] Fatal error', error);
  process.exit(1);
});
