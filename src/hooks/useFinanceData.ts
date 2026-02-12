import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Transaction, Debt } from '../types';

export const useFinanceData = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
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
            setTransactions(transactionsData as Transaction[]);
            setDebts(debtsData as Debt[]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Optional: Realtime subscription could be added here
    }, []);

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('transactions')
                .insert([{ ...transaction, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            setTransactions(prev => [data as Transaction, ...prev]);
        } catch (error) {
            console.error('Error adding transaction:', error);
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

            const { data, error } = await supabase
                .from('debts')
                .insert([{ ...debt, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            setDebts(prev => [data as Debt, ...prev]);
        } catch (error) {
            console.error('Error adding debt:', error);
        }
    };

    const updateDebt = async (id: string, updates: Partial<Debt>) => {
        try {
            const { data, error } = await supabase
                .from('debts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setDebts(prev => prev.map(d => d.id === id ? (data as Debt) : d));
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

