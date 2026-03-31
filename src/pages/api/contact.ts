import type { APIRoute } from 'astro';
import { getContactInquiriesTable, getSupabaseAdminClient } from '@/lib/server/supabase';
import { escapeTelegramHtml, sendTelegramHtmlMessage } from '@/lib/server/telegram';

export const prerender = false;

const CONTACT_REDIRECT_BASE = '/contacts';

const redirectToContacts = (status: 'success' | 'error' | 'validation') =>
  new Response(null, {
    status: 303,
    headers: {
      Location: `${CONTACT_REDIRECT_BASE}?contact=${status}#contact-form`,
    },
  });

const getString = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value.trim() : '');

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const formData = await request.formData();

  if (getString(formData.get('company'))) {
    return redirectToContacts('success');
  }

  const name = getString(formData.get('name'));
  const phone = getString(formData.get('phone'));
  const email = getString(formData.get('email'));
  const message = getString(formData.get('message'));
  const consent = formData.get('consent') === 'on';
  const sourcePage = request.headers.get('referer') || CONTACT_REDIRECT_BASE;
  const userAgent = request.headers.get('user-agent') || undefined;
  const ipAddress = clientAddress || undefined;

  if (!name || !phone || !message || !consent) {
    return redirectToContacts('validation');
  }

  let inquiryId: string | null = null;

  try {
    const supabase = getSupabaseAdminClient(import.meta.env);
    const table = getContactInquiriesTable(import.meta.env);

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
      '<b>Mesaj nou din formularul de contact</b>',
      inquiryId ? `ID: <code>${escapeTelegramHtml(inquiryId)}</code>` : '',
      `Nume: <b>${escapeTelegramHtml(name)}</b>`,
      `Telefon: <code>${escapeTelegramHtml(phone)}</code>`,
      email ? `Email: <code>${escapeTelegramHtml(email)}</code>` : '',
      `Mesaj: ${escapeTelegramHtml(message)}`,
      sourcePage ? `Pagina: ${escapeTelegramHtml(sourcePage)}` : '',
      ipAddress ? `IP: <code>${escapeTelegramHtml(ipAddress)}</code>` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const telegramResult = await sendTelegramHtmlMessage(import.meta.env, telegramMessage);

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
