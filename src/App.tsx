// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FinanceProvider } from './context/FinanceContext';

import { Income } from './pages/Income';
import { Expenses } from './pages/Expenses';
import { Debts } from './pages/Debts';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <FinanceProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="income" element={<Income />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="debts" element={<Debts />} />
            </Route>
          </Route>
        </Routes>
      </FinanceProvider>
    </BrowserRouter>
  );
}

export default App;
