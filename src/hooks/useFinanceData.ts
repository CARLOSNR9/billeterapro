import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import type { Transaction, Debt } from '../types';

export const useFinanceData = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (!user) return;

            const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (transactionsError) throw transactionsError;

            const { data: debtsData, error: debtsError } = await supabase
                .from('debts')
                .select('*')
                .order('created_at', { ascending: false });

            if (debtsError) throw debtsError;

            // Map and format if necessary (e.g. date strings are fine directly usually)
            // Map and format if necessary (e.g. date strings are fine directly usually)
            setTransactions(transactionsData as Transaction[]);

            const formattedDebts: Debt[] = (debtsData || []).map((d: any) => ({
                id: d.id,
                description: d.description,
                totalAmount: d.total_amount,
                paidAmount: d.paid_amount,
                dueDate: d.due_date,
                creditor: d.creditor
            }));
            setDebts(formattedDebts);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                fetchData();
            } else if (event === 'SIGNED_OUT') {
                setTransactions([]);
                setDebts([]);
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await supabase
                .from('transactions')
                .insert([{ ...transaction, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            setTransactions(prev => [data as Transaction, ...prev]);
            return data as Transaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setTransactions(prev => prev.map(t => t.id === id ? (data as Transaction) : t));
        } catch (error) {
            console.error('Error updating transaction:', error);
        }
    };

    const addDebt = async (debt: Omit<Debt, 'id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const debtPayload = {
                user_id: user.id,
                description: debt.description,
                total_amount: debt.totalAmount,
                paid_amount: debt.paidAmount,
                due_date: debt.dueDate,
                creditor: debt.creditor
            };

            const { data, error } = await supabase
                .from('debts')
                .insert([debtPayload])
                .select()
                .single();

            if (error) throw error;

            const newDebt: Debt = {
                id: data.id,
                description: data.description,
                totalAmount: data.total_amount,
                paidAmount: data.paid_amount,
                dueDate: data.due_date,
                creditor: data.creditor
            };
            setDebts(prev => [newDebt as Debt, ...prev]);
        } catch (error) {
            console.error('Error adding debt:', error);
        }
    };

    const updateDebt = async (id: string, updates: Partial<Debt>) => {
        try {
            const updatesPayload: any = {};
            if (updates.description !== undefined) updatesPayload.description = updates.description;
            if (updates.totalAmount !== undefined) updatesPayload.total_amount = updates.totalAmount;
            if (updates.paidAmount !== undefined) updatesPayload.paid_amount = updates.paidAmount;
            if (updates.dueDate !== undefined) updatesPayload.due_date = updates.dueDate;
            if (updates.creditor !== undefined) updatesPayload.creditor = updates.creditor;

            const { data, error } = await supabase
                .from('debts')
                .update(updatesPayload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const updatedDebt: Debt = {
                id: data.id,
                description: data.description,
                totalAmount: data.total_amount,
                paidAmount: data.paid_amount,
                dueDate: data.due_date,
                creditor: data.creditor
            };
            setDebts(prev => prev.map(d => d.id === id ? (updatedDebt as Debt) : d));
        } catch (error) {
            console.error('Error updating debt:', error);
        }
    };

    const deleteDebt = async (id: string) => {
        try {
            const { error } = await supabase
                .from('debts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setDebts(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Error deleting debt:', error);
        }
    };

    const getBalance = () => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0);
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);
        return income - expenses;
    };

    return {
        transactions,
        debts,
        user,
        loading,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addDebt,
        updateDebt,
        deleteDebt,
        getBalance
    };
};

