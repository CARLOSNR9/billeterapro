import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { amount: number; description: string; category: string }) => void;
    onDelete?: () => void;
    initialData?: Transaction | null;
    type: 'income' | 'expense';
    categories: string[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    initialData,
    type,
    categories
}) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(categories[0]);

    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setDescription(initialData.description);
            setCategory(initialData.category);
        } else {
            setAmount('');
            setDescription('');
            setCategory(categories[0]);
        }
    }, [initialData, categories, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;
        onSubmit({
            amount: Number(amount),
            description,
            category
        });
        onClose();
    };

    if (!isOpen) return null;

    const isIncome = type === 'income';
    const bgColorClass = isIncome ? 'bg-blue-600' : 'bg-red-600';
    const hoverBgColorClass = isIncome ? 'hover:bg-blue-700' : 'hover:bg-red-700';
    const ringColorClass = isIncome ? 'focus:ring-blue-500' : 'focus:ring-red-500';
    const shadowColorClass = isIncome ? 'shadow-blue-500/30' : 'shadow-red-500/30';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {initialData ? (isIncome ? 'Editar Ingreso' : 'Editar Gasto') : (isIncome ? 'Nuevo Ingreso' : 'Nuevo Gasto')}
                    </h2>
                    <button
                        onClick={onClose}
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
                                className={`block w-full pl-7 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 ${ringColorClass} focus:border-transparent outline-none transition-all`}
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
                            className={`block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 ${ringColorClass} focus:border-transparent outline-none transition-all`}
                            placeholder={isIncome ? "Ej: Salario Mensual" : "Ej: Mercado, Transporte"}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Categoría
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${category === cat
                                        ? `${bgColorClass} text-white shadow-md ${shadowColorClass}`
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        {initialData && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    onDelete();
                                    onClose();
                                }}
                                className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={20} />
                                Eliminar
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`flex-1 ${bgColorClass} ${hoverBgColorClass} text-white font-bold py-4 rounded-xl shadow-lg ${shadowColorClass} transition-all active:scale-95`}
                        >
                            {initialData ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
