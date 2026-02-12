import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, TrendingDown } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionList } from '../components/TransactionList';
import type { Transaction } from '../types';

export const Expenses: React.FC = () => {
    const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categories = ['Alimentación', 'Transporte', 'Servicios', 'Ocio', 'Salud', 'Otros'];

    const handleCreate = (data: { amount: number; description: string; category: string }) => {
        addTransaction({
            ...data,
            date: new Date().toISOString(),
            type: 'expense'
        });
        setIsModalOpen(false);
    };

    const handleUpdate = (data: { amount: number; description: string; category: string }) => {
        if (selectedTransaction) {
            updateTransaction(selectedTransaction.id, data);
            setSelectedTransaction(null);
            setIsModalOpen(false);
        }
    };

    const handleDelete = () => {
        if (selectedTransaction) {
            deleteTransaction(selectedTransaction.id);
            setSelectedTransaction(null);
            setIsModalOpen(false);
        }
    };

    const openCreateModal = () => {
        setSelectedTransaction(null);
        setIsModalOpen(true);
    };

    const openEditModal = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-24 min-h-screen bg-gray-50 dark:bg-gray-950">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gastos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Controla tus salidas de dinero</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-700 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </header>

            {/* Total Expenses Card */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <TrendingDown size={20} className="text-white" />
                    </div>
                    <span className="font-medium text-red-50">Total Gastos</span>
                </div>
                <p className="text-3xl font-bold">
                    {formatCurrency(expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0))}
                </p>
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historial</h2>
                <TransactionList
                    transactions={expenseTransactions}
                    onEdit={openEditModal}
                    type="expense"
                />
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={selectedTransaction ? handleUpdate : handleCreate}
                onDelete={selectedTransaction ? handleDelete : undefined}
                initialData={selectedTransaction}
                type="expense"
                categories={categories}
            />
        </div>
    );
};

