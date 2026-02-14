-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Transactions Table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  amount numeric not null,
  description text not null,
  date timestamptz not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz default now()
);

-- Debts Table
create table if not exists public.debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  description text not null,
  total_amount numeric not null,
  paid_amount numeric default 0,
  due_date timestamptz,
  creditor text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.transactions enable row level security;
alter table public.debts enable row level security;

-- Policies for Transactions
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Policies for Debts
create policy "Users can view their own debts"
  on public.debts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own debts"
  on public.debts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own debts"
  on public.debts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own debts"
  on public.debts for delete
  using (auth.uid() = user_id);
