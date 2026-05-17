# Telegram bot for Vercel Function

This folder contains a webhook version of the existing `bot` implementation.

The old bot runs as a standalone long-polling Node process. This version runs through the Astro/Vercel API route:

```txt
/api/telegram/webhook
```

## What changed

- Telegram `getUpdates` polling was removed.
- Telegram sends updates to `src/pages/api/telegram/webhook.js`.
- The current bot business logic is reused in `bot_vercel/bot.mjs`.
- Local JSON storage was replaced with Supabase tables.
- Google Calendar helpers still use the Node.js runtime and work in Vercel Functions.

## Required environment variables

Use the same Telegram/Google values you already have for the current bot:

```txt
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=
TELEGRAM_ADMIN_IDS=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CALENDAR_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=
BOT_WEBHOOK_SECRET=
BOT_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

Optional:

```txt
BOT_SUPABASE_TABLE_PREFIX=bot_vercel
BOOKING_TIMEZONE=Europe/Rome
BOT_BOOKING_DURATION_MINUTES=120
BOT_WORKING_HOURS_START=9
BOT_WORKING_HOURS_END=19
BOT_SLOT_INTERVAL_MINUTES=30
BOT_BOOKING_DAYS_AHEAD=14
```

For local development this implementation also reads the existing `bot/.env` file as a fallback, so you do not need to duplicate Telegram token values immediately.

For Vercel deployments, copy the Google Calendar values from `bot/.env` into the Vercel project environment variables. The deployed function cannot read your local `bot/.env` file.

The webhook health endpoint shows whether the deployed calendar is configured:

```bash
curl https://your-domain.com/api/telegram/webhook
```

## Supabase setup

Run the SQL from `bot_vercel/schema.sql` in the Supabase SQL editor.

The default tables are:

- `bot_vercel_bookings`
- `bot_vercel_conversations`
- `bot_vercel_meta`
- `bot_vercel_processed_updates`

If you change `BOT_SUPABASE_TABLE_PREFIX`, rename the tables in the SQL accordingly.

## Register Telegram webhook

After deploying to Vercel and setting env vars:

```bash
npm run bot:vercel:set-webhook
```

The script reads:

- `TELEGRAM_BOT_TOKEN`
- `BOT_WEBHOOK_URL`
- `BOT_WEBHOOK_SECRET`

To disable the webhook and return to the old polling bot:

```bash
npm run bot:vercel:delete-webhook
```

## Local test

Run Astro:

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:4321/api/telegram/webhook
```

Telegram requires a public HTTPS URL for real webhooks. For local end-to-end testing use a tunnel URL and set:

```txt
BOT_WEBHOOK_URL=https://your-tunnel-url/api/telegram/webhook
```

Then run:

```bash
npm run bot:vercel:set-webhook
```

## Important

Do not run the old `npm run bot:start` long-polling process at the same time as this webhook. Use either polling or webhook, not both.
