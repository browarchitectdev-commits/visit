import type { APIRoute } from 'astro';
import { getContactInquiriesTable, getSupabaseAdminClient } from '@/lib/server/supabase';
import { escapeTelegramHtml, sendTelegramHtmlMessage } from '@/lib/server/telegram';

export const prerender = false;

const CONTACT_REDIRECT_BASE = '/contacts';
const MAX_BODY_BYTES = 16 * 1024;
const FIELD_LIMITS = {
  name: 120,
  phone: 60,
  email: 180,
  message: 2000,
  sourcePage: 300,
  userAgent: 300,
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d\s().-]{5,60}$/;

const redirectToContacts = (status: 'success' | 'error' | 'validation') =>
  new Response(null, {
    status: 303,
    headers: {
      Location: `${CONTACT_REDIRECT_BASE}?contact=${status}#contact-form`,
    },
  });

const getString = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value.trim() : '');
const truncate = (value: string, limit: number) => value.slice(0, limit);

const getSafeSourcePage = (request: Request) => {
  const referer = request.headers.get('referer');

  if (!referer) {
    return CONTACT_REDIRECT_BASE;
  }

  try {
    const refererUrl = new URL(referer);
    const requestUrl = new URL(request.url);

    if (refererUrl.origin !== requestUrl.origin) {
      return CONTACT_REDIRECT_BASE;
    }

    return truncate(`${refererUrl.pathname}${refererUrl.search}`, FIELD_LIMITS.sourcePage);
  } catch {
    return CONTACT_REDIRECT_BASE;
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const contentLength = Number(request.headers.get('content-length') ?? 0);

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return redirectToContacts('validation');
  }

  const formData = await request.formData();

  if (getString(formData.get('company'))) {
    return redirectToContacts('success');
  }

  const name = truncate(getString(formData.get('name')), FIELD_LIMITS.name);
  const phone = truncate(getString(formData.get('phone')), FIELD_LIMITS.phone);
  const email = truncate(getString(formData.get('email')), FIELD_LIMITS.email);
  const message = truncate(getString(formData.get('message')), FIELD_LIMITS.message);
  const consent = formData.get('consent') === 'on';
  const sourcePage = getSafeSourcePage(request);
  const userAgent = truncate(request.headers.get('user-agent') || '', FIELD_LIMITS.userAgent) || undefined;
  const ipAddress = clientAddress || undefined;

  if (
    !name ||
    !phone ||
    !message ||
    !consent ||
    !PHONE_PATTERN.test(phone) ||
    (email && !EMAIL_PATTERN.test(email))
  ) {
    return redirectToContacts('validation');
  }

  let inquiryId: string | null = null;

  try {
    const supabase = getSupabaseAdminClient(process.env);
    const table = getContactInquiriesTable(process.env);

    const insertResult = await supabase
      .from(table)
      .insert({
        name,
        phone,
        email: email || null,
        message,
        consent,
        source: 'contacts-form',
        source_page: sourcePage,
        ip_address: ipAddress ?? null,
        user_agent: userAgent ?? null,
        telegram_sent: false,
      })
      .select('id')
      .single();

    if (insertResult.error) {
      console.error('[contact-api] Failed to insert inquiry', insertResult.error);
      return redirectToContacts('error');
    }

    inquiryId = String(insertResult.data.id);

    const telegramMessage = [
      '<b>Nuovo messaggio dal modulo contatti</b>',
      inquiryId ? `ID: <code>${escapeTelegramHtml(inquiryId)}</code>` : '',
      `Nome: <b>${escapeTelegramHtml(name)}</b>`,
      `Telefon: <code>${escapeTelegramHtml(phone)}</code>`,
      email ? `Email: <code>${escapeTelegramHtml(email)}</code>` : '',
      `Messaggio: ${escapeTelegramHtml(message)}`,
      sourcePage ? `Pagina: ${escapeTelegramHtml(sourcePage)}` : '',
      ipAddress ? `IP: <code>${escapeTelegramHtml(ipAddress)}</code>` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const telegramResult = await sendTelegramHtmlMessage(process.env, telegramMessage);

      await supabase
        .from(table)
        .update({
          telegram_sent: true,
          telegram_message_id: telegramResult.result?.message_id ?? null,
          notified_at: new Date().toISOString(),
          telegram_error: null,
        })
        .eq('id', inquiryId);

      return redirectToContacts('success');
    } catch (telegramError) {
      console.error('[contact-api] Failed to send Telegram notification', telegramError);

      await supabase
        .from(table)
        .update({
          telegram_sent: false,
          telegram_error: telegramError instanceof Error ? telegramError.message : 'Unknown Telegram error',
        })
        .eq('id', inquiryId);

      return redirectToContacts('error');
    }
  } catch (error) {
    console.error('[contact-api] Unexpected error', error);
    return redirectToContacts('error');
  }
};
