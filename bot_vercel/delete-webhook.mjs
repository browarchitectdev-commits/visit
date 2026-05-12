import process from 'node:process';
import { loadLocalEnvFile } from './env.mjs';

loadLocalEnvFile();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN');
}

const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    drop_pending_updates: false,
  }),
});

const body = await response.text();

if (!response.ok) {
  throw new Error(`Telegram deleteWebhook failed: ${response.status} ${body}`);
}

console.info(body);
