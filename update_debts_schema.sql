-- Add new columns to debts table
alter table public.debts
add column if not exists interest_rate numeric default 0,
add column if not exists is_interest_only boolean default false,
add column if not exists start_date timestamptz default now();
