create extension if not exists pgcrypto;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  consent boolean not null default false,
  source text not null default 'contacts-form',
  source_page text,
  ip_address text,
  user_agent text,
  telegram_sent boolean not null default false,
  telegram_message_id bigint,
  notified_at timestamptz,
  telegram_error text
);

create index if not exists contact_inquiries_created_at_idx on public.contact_inquiries (created_at desc);
create index if not exists contact_inquiries_telegram_sent_idx on public.contact_inquiries (telegram_sent);
