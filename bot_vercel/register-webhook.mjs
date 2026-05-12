import process from 'node:process';
import { loadLocalEnvFile } from './env.mjs';

loadLocalEnvFile();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const publicUrl = process.env.BOT_WEBHOOK_URL;
const secret = process.env.BOT_WEBHOOK_SECRET;

if (!botToken) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN');
}

if (!publicUrl) {
  throw new Error('Missing BOT_WEBHOOK_URL. Example: https://example.com/api/telegram/webhook');
}

const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: publicUrl,
    secret_token: secret || undefined,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  }),
});

const body = await response.text();

if (!response.ok) {
  throw new Error(`Telegram setWebhook failed: ${response.status} ${body}`);
}

console.info(body);
