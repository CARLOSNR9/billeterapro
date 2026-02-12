import React from 'react';
import { DollarSign, TrendingDown, Pencil } from 'lucide-react';
import type { Transaction } from '../types';

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    type: 'income' | 'expense';
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, type }) => {
    const isIncome = type === 'income';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 dark:text-gray-100 font-medium">
                    Sin {isIncome ? 'ingresos' : 'gastos'} registrados
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Agrega tu primer {isIncome ? 'ingreso' : 'gasto'} pulsando el botón +
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((t) => (
                <div key={t.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center group transition-all hover:shadow-md">
                    <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isIncome
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            }`}>
                            {isIncome ? <DollarSign size={24} /> : <TrendingDown size={24} />}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{t.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                    {t.category}
                                </span>
                                <span>•</span>
                                <span>{new Date(t.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                        <button
                            onClick={() => onEdit(t)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            <Pencil size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
