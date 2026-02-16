export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string; // ISO date string
    category: string;
    type: TransactionType;
    debtId?: string;
}

export interface Debt {
    id: string;
    description: string;
    totalAmount: number;
    paidAmount: number;
    dueDate?: string;
    creditor?: string; // Who do I owe?
    interestRate?: number;
    isInterestOnly?: boolean;
    totalInstallments?: number;
    installmentAmount?: number;
    startDate?: string;
}

export interface UserSettings {
    currency: string;
    theme: 'light' | 'dark' | 'system';
}
