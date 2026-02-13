import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingDown, CreditCard } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
        >
            <Icon className={cn("w-6 h-6 mb-1", isActive && "stroke-[2.5px]")} />
            <span>{label}</span>
        </Link>
    );
};

export const Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))]">
                <div className="max-w-md mx-auto min-h-full bg-white dark:bg-gray-950 shadow-sm relative">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50 pb-[env(safe-area-inset-bottom)]">
                <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
                    <NavItem to="/" icon={LayoutDashboard} label="Inicio" />
                    <NavItem to="/income" icon={Wallet} label="Ingresos" />
                    <NavItem to="/expenses" icon={TrendingDown} label="Gastos" />
                    <NavItem to="/debts" icon={CreditCard} label="Deudas" />
                </div>
            </nav>
        </div>
    );
};
