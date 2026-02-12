import { useState, useEffect } from 'react';
import type { Transaction, Debt } from '../types';

const STORAGE_KEYS = {
    TRANSACTIONS: 'billetera_transactions',
    DEBTS: 'billetera_debts'
};

export const useFinanceData = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        return saved ? JSON.parse(saved) : [];
    });

    const [debts, setDebts] = useState<Debt[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    }, [debts]);

    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transaction, id: crypto.randomUUID() };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const addDebt = (debt: Omit<Debt, 'id'>) => {
        const newDebt = { ...debt, id: crypto.randomUUID() };
        setDebts(prev => [newDebt, ...prev]);
    };

    const updateDebt = (id: string, updates: Partial<Debt>) => {
        setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const deleteDebt = (id: string) => {
        setDebts(prev => prev.filter(d => d.id !== id));
    };

    const updateTransaction = (id: string, updates: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
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
        addTransaction,
        deleteTransaction,
        addDebt,
        updateDebt,
        deleteDebt,
        updateTransaction,
        getBalance
    };
};
