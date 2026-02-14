-- Add debt_id column to transactions table to link expenses to debts
alter table public.transactions
add column if not exists debt_id uuid references public.debts(id);
