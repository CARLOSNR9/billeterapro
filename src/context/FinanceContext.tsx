import React, { createContext, useContext, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useFinanceData } from '../hooks/useFinanceData';
import type { Transaction, Debt } from '../types';

interface FinanceContextType {
    transactions: Transaction[];
    debts: Debt[];
    user: User | null;
    loading: boolean;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
    deleteTransaction: (id: string) => void;
    addDebt: (debt: Omit<Debt, 'id'>) => Promise<Debt>;
    updateDebt: (id: string, updates: Partial<Debt>) => void;
    deleteDebt: (id: string) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    getBalance: () => number;
}

const FinanceContext = createContext<FinanceContextType>({
    transactions: [],
    debts: [],
    user: null,
    loading: true,
    addTransaction: async () => { throw new Error('addTransaction not implemented'); },
    deleteTransaction: () => { },
    addDebt: async () => { throw new Error('addDebt not implemented'); },
    updateDebt: () => { },
    deleteDebt: () => { },
    updateTransaction: () => { },
    getBalance: () => 0
});

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const financeData = useFinanceData();

    return (
        <FinanceContext.Provider value={financeData}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
