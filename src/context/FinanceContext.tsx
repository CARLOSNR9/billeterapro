import React, { createContext, useContext, type ReactNode } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import type { Transaction, Debt } from '../types';

interface FinanceContextType {
    transactions: Transaction[];
    debts: Debt[];
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    addDebt: (debt: Omit<Debt, 'id'>) => void;
    updateDebt: (id: string, updates: Partial<Debt>) => void;
    deleteDebt: (id: string) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    getBalance: () => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

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
