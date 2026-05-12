create table if not exists public.bot_vercel_bookings (
  id bigint primary key,
  telegram_user_id text not null,
  status text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.bot_vercel_bookings enable row level security;

create index if not exists bot_vercel_bookings_telegram_user_id_idx
  on public.bot_vercel_bookings (telegram_user_id);

create index if not exists bot_vercel_bookings_status_idx
  on public.bot_vercel_bookings (status);

create table if not exists public.bot_vercel_conversations (
  user_id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.bot_vercel_conversations enable row level security;

create table if not exists public.bot_vercel_meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.bot_vercel_meta enable row level security;

insert into public.bot_vercel_meta (key, value)
values ('state', '{"nextBookingId": 1}'::jsonb)
on conflict (key) do nothing;

create table if not exists public.bot_vercel_processed_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);

alter table public.bot_vercel_processed_updates enable row level security;
