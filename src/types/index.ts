export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string; // ISO date string
    category: string;
    type: TransactionType;
}

export interface Debt {
    id: string;
    description: string;
    totalAmount: number;
    paidAmount: number;
    dueDate?: string;
    creditor?: string; // Who do I owe?
}

export interface UserSettings {
    currency: string;
    theme: 'light' | 'dark' | 'system';
}
