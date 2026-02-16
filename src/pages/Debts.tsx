import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, X, CreditCard, Trash2, CheckCircle2, Pencil } from 'lucide-react';
import type { Debt } from '../types';

export const Debts: React.FC = () => {
    const { debts, addDebt, deleteDebt, updateDebt, addTransaction, transactions } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit State
    const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    // History Modal State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Form State
    const [totalAmount, setTotalAmount] = useState('');
    const [description, setDescription] = useState('');
    const [creditor, setCreditor] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isInterestOnly, setIsInterestOnly] = useState(false);

    // Payment State
    const [isPaymentCapital, setIsPaymentCapital] = useState(true);
    const [isPaymentAmortized, setIsPaymentAmortized] = useState(false); // New state for amortized payment type

    // Amortization Form State
    const [totalInstallments, setTotalInstallments] = useState('');
    const [installmentAmount, setInstallmentAmount] = useState('');
    const [isAmortized, setIsAmortized] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!totalAmount || !description) return;

        try {
            if (editingDebtId) {
                // Update existing debt
                await updateDebt(editingDebtId, {
                    totalAmount: Number(totalAmount),
                    description,
                    creditor: creditor || 'Banco',
                    dueDate: dueDate || undefined,
                    interestRate: interestRate ? Number(interestRate) : undefined,
                    startDate: startDate,
                    isInterestOnly: isInterestOnly,
                    totalInstallments: isAmortized ? Number(totalInstallments) : undefined,
                    installmentAmount: isAmortized ? Number(installmentAmount) : undefined
                });
            } else {
                // Create new debt
                await addDebt({
                    totalAmount: Number(totalAmount),
                    description,
                    paidAmount: 0,
                    creditor: creditor || 'Banco',
                    dueDate: dueDate || undefined,
                    interestRate: interestRate ? Number(interestRate) : undefined,
                    startDate: startDate,
                    isInterestOnly: isInterestOnly,
                    totalInstallments: isAmortized ? Number(totalInstallments) : undefined,
                    installmentAmount: isAmortized ? Number(installmentAmount) : undefined
                });
            }

            // Reset form
            setEditingDebtId(null);
            setTotalAmount('');
            setDescription('');
            setCreditor('');
            setDueDate('');
            setInterestRate('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setIsInterestOnly(false);
            setIsAmortized(false);
            setTotalInstallments('');
            setInstallmentAmount('');
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving debt:', error);
            alert(`Error al guardar la deuda: ${error.message || 'Error desconocido'}`);
        }
    };

    const handleEdit = (debt: Debt) => {
        setEditingDebtId(debt.id);
        setTotalAmount(debt.totalAmount.toString());
        setDescription(debt.description);
        setCreditor(debt.creditor || '');
        setDueDate(debt.dueDate || '');
        setInterestRate(debt.interestRate ? debt.interestRate.toString() : '');
        setStartDate(debt.startDate || new Date().toISOString().split('T')[0]);
        setIsInterestOnly(debt.isInterestOnly || false);
        setIsAmortized(!!debt.totalInstallments);
        setTotalInstallments(debt.totalInstallments ? debt.totalInstallments.toString() : '');
        setInstallmentAmount(debt.installmentAmount ? debt.installmentAmount.toString() : '');
        setIsModalOpen(true);
    };

    const openPaymentModal = (id: string) => {
        const debt = debts.find(d => d.id === id);
        if (debt) {
            setSelectedDebtId(id);
            setPaymentAmount('');
            setPaymentAmount('');
            setIsPaymentCapital(true); // Default to capital payment
            setIsPaymentAmortized(!!debt.installmentAmount); // Default to amortized payment if available
            if (debt.installmentAmount) {
                setPaymentAmount(debt.installmentAmount.toString());
            }
            setIsPaymentModalOpen(true);
        }
    };

    const getMonthlyInterest = (totalAmount: number, interestRate?: number) => {
        if (!interestRate) return 0;
        return (totalAmount * interestRate) / 100;
    };

    const getPaymentStatus = (debtId: string, startDate?: string) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const dayOfMonth = today.getDate();

        // 1. Check if interest was paid this month
        const hasPaidInterest = transactions.some(t =>
            t.debtId === debtId &&
            t.type === 'expense' &&
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear
        );

        if (hasPaidInterest) {
            return { status: 'Pagado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
        }

        // 2. Determine due day (default to 1st if no startDate)
        let dueDay = 1;
        if (startDate) {
            const parts = startDate.split('-');
            if (parts.length === 3) dueDay = parseInt(parts[2]);
        }

        // 3. Check if overdue
        if (dayOfMonth > dueDay) {
            return { status: 'Vencido', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
        }

        return { status: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDebtId || !paymentAmount) return;

        const debt = debts.find(d => d.id === selectedDebtId);
        if (!debt) return;

        // Check for double interest payment
        if (!isPaymentCapital && !isPaymentAmortized) {
            const today = new Date();
            const hasPaidInterestThisMonth = transactions.some(t =>
                t.debtId === selectedDebtId &&
                t.type === 'expense' &&
                (t.description.toLowerCase().includes('interés') || t.description.toLowerCase().includes('interes')) &&
                new Date(t.date).getMonth() === today.getMonth() &&
                new Date(t.date).getFullYear() === today.getFullYear()
            );

            if (hasPaidInterestThisMonth) {
                const confirm = window.confirm('⚠️ Alerta: Ya has registrado un pago de intereses para esta deuda en este mes. ¿Deseas continuar y registrar otro pago?');
                if (!confirm) return;
            }
        }

        const amountToAdd = Number(paymentAmount);
        if (amountToAdd <= 0) return;

        try {
            // Logic for Amortized Payment (Fixed Installment)
            if (isPaymentAmortized && debt.installmentAmount && debt.interestRate) {
                const interestPortion = Math.round((debt.totalAmount - debt.paidAmount) * (debt.interestRate / 100));
                const capitalPortion = Number(paymentAmount) - interestPortion;

                if (capitalPortion <= 0) {
                    alert('El monto del pago no cubre los intereses generados. Aumenta el monto.');
                    return;
                }

                // 1. Record Transaction (Split or Single?) - Let's do single transaction as "Pago Cuota" but description details it
                await addTransaction({
                    amount: Number(paymentAmount),
                    description: `Pago Cuota ${debt.description} (Int: ${formatCurrency(interestPortion)}, Cap: ${formatCurrency(capitalPortion)})`,
                    date: new Date().toISOString(),
                    category: 'Deudas',
                    type: 'expense',
                    debtId: debt.id
                });

                // 2. Update Debt (Paid Amount increases ONLY by Capital Portion)
                const currentPaid = debt.paidAmount;
                const finalPaid = currentPaid + capitalPortion;
                await updateDebt(selectedDebtId, { paidAmount: finalPaid });
                alert(`Cuota registrada. Abono a capital: ${formatCurrency(capitalPortion)}. Interés pagado: ${formatCurrency(interestPortion)}.`);
            }
            else {
                // Existing Logic (Original Capital or Interest Only)
                // 1. Record the Expense (Transaction)
                await addTransaction({
                    amount: amountToAdd,
                    description: isPaymentCapital
                        ? `Abono a Capital: ${debt.description}`
                        : `Pago Intereses: ${debt.description}`,
                    date: new Date().toISOString(),
                    category: isPaymentCapital ? 'Deudas' : 'Intereses',
                    type: 'expense',
                    debtId: debt.id
                });

                // 2. If Capital Payment, Update Debt Balance
                if (isPaymentCapital) {
                    const currentPaid = debt.paidAmount;
                    const remaining = debt.totalAmount - currentPaid;
                    const finalAmountToAdd = Math.min(amountToAdd, remaining);
                    await updateDebt(selectedDebtId, { paidAmount: currentPaid + finalAmountToAdd });
                    alert('Abono registrado y gasto creado correctamente.');
                } else {
                    alert('Pago de intereses registrado como gasto. La deuda capital se mantiene igual.');
                }
            }

            // Reset and close
            setIsPaymentModalOpen(false);
            setPaymentAmount('');
            setSelectedDebtId(null);
        } catch (error: any) {
            console.error('Error processing payment:', error);
            alert(`Error al procesar el pago: ${error.message}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const calculateProgress = (paid: number, total: number) => {
        return Math.min(100, (paid / total) * 100);
    };

    return (
        <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-24 min-h-screen bg-gray-50 dark:bg-gray-950">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Deudas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Administra tus obligaciones</p>
                </div>
                <button
                    onClick={() => {
                        setEditingDebtId(null);
                        setTotalAmount('');
                        setDescription('');
                        setCreditor('');
                        setDueDate('');
                        setInterestRate('');
                        setStartDate(new Date().toISOString().split('T')[0]);
                        setIsInterestOnly(false);
                        setIsAmortized(false);
                        setTotalInstallments('');
                        setInstallmentAmount('');
                        setIsModalOpen(true);
                    }}
                    className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </header>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <CreditCard size={20} className="text-white" />
                    </div>
                    <span className="font-medium text-purple-50">Total Deuda Pendiente</span>
                </div>
                <p className="text-3xl font-bold">
                    {formatCurrency(debts.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0))}
                </p>
            </div>

            {/* Debts List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mis Deudas</h2>
                {debts.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-gray-900 dark:text-gray-100 font-medium">¡Estás libre de deudas!</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Disfruta de tu libertad financiera
                        </p>
                    </div>
                ) : (
                    debts.map((debt) => {
                        const monthlyInterest = getMonthlyInterest(debt.totalAmount, debt.interestRate);
                        const status = getPaymentStatus(debt.id, debt.startDate);

                        return (
                            <div key={debt.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{debt.description}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                                                {status.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Acreedor: {debt.creditor}</p>
                                        {debt.installmentAmount && (
                                            <p className="text-xs text-blue-600 font-medium mt-0.5">
                                                Cuota Fija: {formatCurrency(debt.installmentAmount)} / mes
                                            </p>
                                        )}
                                        {debt.interestRate && debt.interestRate > 0 && (
                                            <div className="mt-1">
                                                <p className="text-xs text-purple-600 font-medium">
                                                    Interés: {debt.interestRate}% ({formatCurrency(monthlyInterest)}/mes)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(debt.totalAmount)}</p>
                                        <p className="text-xs text-red-500 font-medium">Restante: {formatCurrency(debt.totalAmount - debt.paidAmount)}</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4 mb-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Pagado: {formatCurrency(debt.paidAmount)}</span>
                                        <span>{Math.round(calculateProgress(debt.paidAmount, debt.totalAmount))}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                            style={{ width: `${calculateProgress(debt.paidAmount, debt.totalAmount)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={() => deleteDebt(debt.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(debt)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedDebtId(debt.id);
                                            setIsHistoryModalOpen(true);
                                        }}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Historial
                                    </button>
                                    {debt.paidAmount < debt.totalAmount && (
                                        <button
                                            onClick={() => openPaymentModal(debt.id)}
                                            className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                        >
                                            Abonar / Pagar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add/Edit Debt Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {editingDebtId ? 'Editar Deuda' : 'Nueva Deuda'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Monto Total
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        value={totalAmount}
                                        onChange={(e) => setTotalAmount(e.target.value)}
                                        className="block w-full pl-7 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción / Concepto
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Ej: Préstamo Magda"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Acreedor (A quién le debes)
                                </label>
                                <input
                                    type="text"
                                    value={creditor}
                                    onChange={(e) => setCreditor(e.target.value)}
                                    className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Ej: Banco, Amigo"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tasa de Interés (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Ej: 5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fecha Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="interestOnly"
                                    checked={isInterestOnly}
                                    onChange={(e) => setIsInterestOnly(e.target.checked)}
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                                />
                                <label htmlFor="interestOnly" className="text-sm text-gray-700 dark:text-gray-300">
                                    Solo pago intereses por ahora
                                </label>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="isAmortized"
                                    checked={isAmortized}
                                    onChange={(e) => setIsAmortized(e.target.checked)}
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                                />
                                <label htmlFor="isAmortized" className="text-sm text-gray-700 dark:text-gray-300">
                                    Es un préstamo con cuota fija (Amortización)
                                </label>
                            </div>

                            {isAmortized && (
                                <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Valor Cuota
                                        </label>
                                        <input
                                            type="number"
                                            value={installmentAmount}
                                            onChange={(e) => setInstallmentAmount(e.target.value)}
                                            className="block w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            # Cuotas
                                        </label>
                                        <input
                                            type="number"
                                            value={totalInstallments}
                                            onChange={(e) => setTotalInstallments(e.target.value)}
                                            className="block w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Ej: 36"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fecha límite (Opcional)
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    min={startDate}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all active:scale-95 mt-4"
                            >
                                {editingDebtId ? 'Actualizar Deuda' : 'Guardar Deuda'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Registrar Pago</h2>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo de Pago
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPaymentCapital(true);
                                            setPaymentAmount('');
                                        }}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isPaymentCapital
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        Abono a Capital
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPaymentAmortized(false);
                                            setIsPaymentCapital(false);
                                            const debt = debts.find(d => d.id === selectedDebtId);
                                            if (debt && debt.interestRate) {
                                                const interestAmount = (debt.totalAmount * debt.interestRate) / 100;
                                                setPaymentAmount(Math.round(interestAmount).toString());
                                            } else {
                                                setPaymentAmount('');
                                            }
                                        }}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${!isPaymentCapital && !isPaymentAmortized
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        Pago Intereses
                                    </button>
                                </div>

                                {selectedDebtId && debts.find(d => d.id === selectedDebtId)?.installmentAmount && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPaymentAmortized(true);
                                            setIsPaymentCapital(false); // Can be false as it's a mix
                                            const debt = debts.find(d => d.id === selectedDebtId);
                                            if (debt && debt.installmentAmount) {
                                                setPaymentAmount(debt.installmentAmount.toString());
                                            }
                                        }}
                                        className={`w-full mt-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isPaymentAmortized
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            }`}
                                    >
                                        Pagar Cuota Fija (Amortización)
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Monto a Pagar
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="block w-full pl-7 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                {isPaymentCapital && selectedDebtId && debts.find(d => d.id === selectedDebtId) && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Restante Capital: {formatCurrency(debts.find(d => d.id === selectedDebtId)!.totalAmount - debts.find(d => d.id === selectedDebtId)!.paidAmount)}
                                    </p>
                                )}
                                {!isPaymentCapital && selectedDebtId && debts.find(d => d.id === selectedDebtId) && (
                                    <p className="text-xs text-purple-600 mt-2 font-medium">
                                        Interés Mensual Sugerido: {formatCurrency((debts.find(d => d.id === selectedDebtId)!.totalAmount * (debts.find(d => d.id === selectedDebtId)!.interestRate || 0)) / 100)}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 mt-4"
                            >
                                Confirmar Pago
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && selectedDebtId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Historial de Pagos</h2>
                            <button
                                onClick={() => {
                                    setIsHistoryModalOpen(false);
                                    setSelectedDebtId(null);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {transactions
                                .filter(t => t.debtId === selectedDebtId && t.type === 'expense')
                                .length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No hay pagos registrados aún.</p>
                            ) : (
                                transactions
                                    .filter(t => t.debtId === selectedDebtId && t.type === 'expense')
                                    .map(t => (
                                        <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{t.description}</p>
                                                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                                            </div>
                                            <p className="font-bold text-red-500">
                                                - {formatCurrency(t.amount)}
                                            </p>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
