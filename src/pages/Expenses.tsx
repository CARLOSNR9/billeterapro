import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, X, TrendingDown, DollarSign } from 'lucide-react';

export const Expenses: React.FC = () => {
    const { transactions, addTransaction } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Alimentación');

    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        addTransaction({
            amount: Number(amount),
            description,
            category,
            date: new Date().toISOString(),
            type: 'expense'
        });

        // Reset form and close modal
        setAmount('');
        setDescription('');
        setCategory('Alimentación');
        setIsModalOpen(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="p-4 pb-24 min-h-screen bg-gray-50 dark:bg-gray-950">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gastos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Controla tus salidas de dinero</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
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

            {/* Transactions List */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historial</h2>
                {expenseTransactions.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <DollarSign className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 dark:text-gray-100 font-medium">Sin gastos registrados</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Agrega tu primer gasto pulsando el botón +
                        </p>
                    </div>
                ) : (
                    expenseTransactions.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                                    <TrendingDown size={24} />
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
                            <span className="font-bold text-red-600 dark:text-red-400">
                                -{formatCurrency(t.amount)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Add Expense Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nuevo Gasto</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Monto
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="block w-full pl-7 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Ej: Mercado, Transporte"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Categoría
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Alimentación', 'Transporte', 'Servicios', 'Ocio'].map((cat) => (
                                        <button
                                            type="button"
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${category === cat
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95 mt-4"
                            >
                                Guardar Gasto
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
