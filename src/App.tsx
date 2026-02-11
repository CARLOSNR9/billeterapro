// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FinanceProvider } from './context/FinanceContext';

// Placeholders for other pages
const Income = () => <div className="p-4"><h1 className="text-xl font-bold">Ingresos</h1></div>;
const Expenses = () => <div className="p-4"><h1 className="text-xl font-bold">Gastos</h1></div>;
const Debts = () => <div className="p-4"><h1 className="text-xl font-bold">Deudas</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <FinanceProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="income" element={<Income />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="debts" element={<Debts />} />
          </Route>
        </Routes>
      </FinanceProvider>
    </BrowserRouter>
  );
}

export default App;
