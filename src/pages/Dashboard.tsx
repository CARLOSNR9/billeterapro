import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { getBalance, debts, transactions } = useFinance();

    const balance = getBalance();
    const totalDebts = debts.reduce((acc, debt) => acc + (debt.totalAmount - debt.paidAmount), 0);
    const recentTransactions = transactions.slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    BilleteraPro
                </h1>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                    JP
                </div>
            </header>

            {/* Summary Cards */}
            <section className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-blue-100 text-sm font-medium mb-1">Balance Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Por Pagar</p>
                    <p className="text-red-500 text-2xl font-bold">{formatCurrency(totalDebts)}</p>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-3">
                <a href="/income" className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl flex flex-col items-center justify-center gap-2 border border-green-100 dark:border-green-900/30 active:scale-95 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-600 text-green-600 dark:text-white flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Ingreso</span>
                </a>
                <a href="/expenses" className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex flex-col items-center justify-center gap-2 border border-red-100 dark:border-red-900/30 active:scale-95 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-600 text-red-600 dark:text-white flex items-center justify-center">
                        <TrendingDown size={20} />
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Gasto</span>
                </a>
            </section>

            {/* Recent Activity */}
            <section>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">Actividad Reciente</h2>
                    {transactions.length > 0 && (
                        <span className="text-xs text-blue-600 font-medium cursor-pointer">Ver todo</span>
                    )}
                </div>

                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <div className="p-8 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <DollarSign className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No hay transacciones recientes</p>
                        </div>
                    ) : (
                        recentTransactions.map((t) => (
                            <div key={t.id} className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income'
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{t.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};
