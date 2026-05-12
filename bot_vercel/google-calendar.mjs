import { createSign } from 'node:crypto';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';
const CALENDAR_API_BASE_URL = 'https://www.googleapis.com/calendar/v3';

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

const parseServiceAccountJson = (rawJson) => {
  if (!rawJson?.trim()) {
    return null;
  }

  return JSON.parse(rawJson);
};

const createJwtAssertion = (serviceAccount) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const payload = {
    iss: serviceAccount.client_email,
    scope: GOOGLE_CALENDAR_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: nowInSeconds + 3600,
    iat: nowInSeconds,
  };

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  const signature = signer
    .sign(serviceAccount.private_key, 'base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

  return `${signingInput}.${signature}`;
};

const normalizeCalendarId = (calendarId) => {
  const trimmed = calendarId?.trim();

  if (!trimmed) {
    return trimmed;
  }

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

const getAccessToken = async (serviceAccount) => {
  const assertion = createJwtAssertion(serviceAccount);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok || !data?.access_token) {
    throw new Error(`Failed to get Google access token: ${response.status} ${text}`);
  }

  return data.access_token;
};

const dateKeyFormatterCache = new Map();
const dateTimePartsFormatterCache = new Map();

const getDateKeyFormatter = (timeZone) => {
  if (!dateKeyFormatterCache.has(timeZone)) {
    dateKeyFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    );
  }

  return dateKeyFormatterCache.get(timeZone);
};

const getDateTimePartsFormatter = (timeZone) => {
  if (!dateTimePartsFormatterCache.has(timeZone)) {
    dateTimePartsFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }),
    );
  }

  return dateTimePartsFormatterCache.get(timeZone);
};

const getFormatterParts = (date, timeZone) => {
  const parts = getDateTimePartsFormatter(timeZone)
    .formatToParts(date)
    .reduce((accumulator, part) => {
      if (part.type !== 'literal') {
        accumulator[part.type] = part.value;
      }
      return accumulator;
    }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
};

const formatDateKey = (date, timeZone) => {
  const parts = getFormatterParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
};

const parseDateKey = (dateKey) => {
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

const shiftDateKey = (dateKey, deltaDays) => {
  const parsed = parseDateKey(dateKey);

  if (!parsed) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  const shifted = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + deltaDays, 12, 0, 0, 0));
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toUtcDate = (dateKey, timeKey, timeZone) => {
  const parsed = parseDateKey(dateKey);
  const timeMatch = String(timeKey ?? '').match(/^(\d{2}):(\d{2})$/);

  if (!parsed || !timeMatch) {
    return null;
  }

  const targetUtcTimestamp = Date.UTC(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    Number(timeMatch[1]),
    Number(timeMatch[2]),
    0,
    0,
  );

  let guessTimestamp = targetUtcTimestamp;

  for (let index = 0; index < 4; index += 1) {
    const parts = getFormatterParts(new Date(guessTimestamp), timeZone);
    const observedUtcTimestamp = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      0,
    );
    const delta = targetUtcTimestamp - observedUtcTimestamp;

    if (delta === 0) {
      return new Date(guessTimestamp);
    }

    guessTimestamp += delta;
  }

  return new Date(guessTimestamp);
};

const callCalendarApi = async ({ accessToken, path, method = 'GET', body = undefined }) => {
  const response = await fetch(`${CALENDAR_API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Google Calendar API ${method} ${path} failed: ${response.status} ${text}`);
  }

  return data;
};

const getServiceAccountAccessToken = async (serviceAccountJson) => {
  const serviceAccount = parseServiceAccountJson(serviceAccountJson);

  if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON');
  }

  return {
    serviceAccount,
    accessToken: await getAccessToken(serviceAccount),
  };
};

const overlaps = (slotStart, slotEnd, busyInterval) => slotStart < busyInterval.end && slotEnd > busyInterval.start;

export const isGoogleCalendarConfigured = (env) =>
  Boolean(env.GOOGLE_CALENDAR_ID && env.GOOGLE_SERVICE_ACCOUNT_JSON);

export const parseBookingDateTime = (value, timeZone = 'Europe/Chisinau') => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  return toUtcDate(`${match[1]}-${match[2]}-${match[3]}`, `${match[4]}:${match[5]}`, timeZone);
};

export const listDateOptions = ({ timeZone, days = 14 }) => {
  const todayKey = formatDateKey(new Date(), timeZone);
  return Array.from({ length: days }, (_, index) => shiftDateKey(todayKey, index));
};

export const getBusyIntervals = async ({
  calendarId,
  serviceAccountJson,
  timeZone,
  startDate,
  endDate,
}) => {
  const normalizedCalendarId = normalizeCalendarId(calendarId);
  const { accessToken } = await getServiceAccountAccessToken(serviceAccountJson);
  const data = await callCalendarApi({
    accessToken,
    path: '/freeBusy',
    method: 'POST',
    body: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      timeZone,
      items: [{ id: normalizedCalendarId }],
    },
  });

  const busy = data?.calendars?.[normalizedCalendarId]?.busy ?? [];
  return busy
    .map((interval) => ({
      start: new Date(interval.start),
      end: new Date(interval.end),
    }))
    .filter((interval) => !Number.isNaN(interval.start.getTime()) && !Number.isNaN(interval.end.getTime()));
};

export const getAvailableSlotsForDate = async ({
  calendarId,
  serviceAccountJson,
  dateKey,
  timeZone,
  durationMinutes,
  slotIntervalMinutes = 30,
  workingHoursStart = 9,
  workingHoursEnd = 19,
}) => {
  const dayStart = toUtcDate(dateKey, `${String(workingHoursStart).padStart(2, '0')}:00`, timeZone);
  const dayEnd = toUtcDate(dateKey, `${String(workingHoursEnd).padStart(2, '0')}:00`, timeZone);

  if (!dayStart || !dayEnd) {
    throw new Error(`Invalid day boundaries for ${dateKey}`);
  }

  const busyIntervals = await getBusyIntervals({
    calendarId,
    serviceAccountJson,
    timeZone,
    startDate: dayStart,
    endDate: dayEnd,
  });

  const now = new Date();
  const slots = [];
  const lastPossibleStart = dayEnd.getTime() - durationMinutes * 60 * 1000;

  for (
    let slotStartTimestamp = dayStart.getTime();
    slotStartTimestamp <= lastPossibleStart;
    slotStartTimestamp += slotIntervalMinutes * 60 * 1000
  ) {
    const slotStart = new Date(slotStartTimestamp);
    const slotEnd = new Date(slotStartTimestamp + durationMinutes * 60 * 1000);

    if (slotStart <= now) {
      continue;
    }

    const isBusy = busyIntervals.some((busyInterval) => overlaps(slotStart, slotEnd, busyInterval));

    if (isBusy) {
      continue;
    }

    const parts = getFormatterParts(slotStart, timeZone);
    slots.push(`${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`);
  }

  return slots;
};

export const createCalendarEvent = async ({
  calendarId,
  serviceAccountJson,
  summary,
  description,
  startDate,
  durationMinutes,
  timeZone,
}) => {
  const normalizedCalendarId = normalizeCalendarId(calendarId);
  const { accessToken } = await getServiceAccountAccessToken(serviceAccountJson);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const data = await callCalendarApi({
    accessToken,
    path: `/calendars/${encodeURIComponent(normalizedCalendarId)}/events`,
    method: 'POST',
    body: {
      summary,
      description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone,
      },
    },
  });

  if (!data?.id) {
    throw new Error('Failed to create Google Calendar event: missing event id');
  }

  return data;
};
