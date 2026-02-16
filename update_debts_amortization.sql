-- Add columns for amortized loans
alter table public.debts 
add column if not exists total_installments integer,
add column if not exists installment_amount numeric;
