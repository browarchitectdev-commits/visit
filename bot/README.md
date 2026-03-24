# Telegram Bot

This bot is a standalone Node.js process. It is not meant to run inside Astro or Vercel serverless functions.

## Required env

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`
- `TELEGRAM_ADMIN_IDS`

## Optional env

- `BOT_STORAGE_PATH` default: `./bot/data/bookings.json`
- `BOOKING_TIMEZONE` default: `Europe/Chisinau`
- `BOT_BOOKING_DURATION_MINUTES` default: `120`
- `BOT_WORKING_HOURS_START` default: `9`
- `BOT_WORKING_HOURS_END` default: `19`
- `BOT_SLOT_INTERVAL_MINUTES` default: `30`
- `BOT_BOOKING_DAYS_AHEAD` default: `14`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `BOT_WEBHOOK_SECRET`

## Run locally

```bash
npm run bot:start
```

The current implementation uses Telegram long polling and stores booking requests in a local JSON file.

Use a raw Google Calendar id in env, for example `nikomisha@gmail.com`, not a URL-encoded value like `nikomisha%40gmail.com`.

## Booking flow

The client now chooses:

1. service
2. date from an inline calendar-like picker
3. time from available slots only
4. optional note

Busy slots are loaded from Google Calendar, so occupied time is not shown in Telegram.

## Notes

- Google Calendar must be configured for slot filtering and event creation.
- Time slots are generated inside the working-hours window and respect the selected booking duration.
- If Google Calendar is unavailable, the bot falls back to manual date entry in `YYYY-MM-DD HH:mm` format.
