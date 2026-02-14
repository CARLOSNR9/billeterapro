import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Wallet } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionList } from '../components/TransactionList';
import type { Transaction } from '../types';

export const Income: React.FC = () => {
    const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const categories = ['Salario', 'Freelance', 'Regalo', 'Otros'];

    const handleCreate = async (data: { amount: number; description: string; category: string }) => {
        try {
            await addTransaction({
                ...data,
                date: new Date().toISOString(),
                type: 'income'
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating income:', error);
            alert('Error al registrar el ingreso. Por favor intente de nuevo.');
        }
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ingresos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona tus entradas de dinero</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </header>

            {/* Total Income Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/20 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Wallet size={20} className="text-white" />
                    </div>
                    <span className="font-medium text-green-50">Total Ingresos</span>
                </div>
                <p className="text-3xl font-bold">
                    {formatCurrency(incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0))}
                </p>
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historial</h2>
                <TransactionList
                    transactions={incomeTransactions}
                    onEdit={openEditModal}
                    type="income"
                />
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={selectedTransaction ? handleUpdate : handleCreate}
                onDelete={selectedTransaction ? handleDelete : undefined}
                initialData={selectedTransaction}
                type="income"
                categories={categories}
            />
        </div>
    );
};

