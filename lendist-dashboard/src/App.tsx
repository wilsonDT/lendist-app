import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import BorrowersPage from './pages/BorrowersPage';
import LoansPage from './pages/LoansPage';
import LoanDetailPage from './pages/LoanDetailPage';
import RepaymentPage from './pages/RepaymentPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/borrowers" element={<BorrowersPage />} />
      <Route path="/loans" element={<LoansPage />} />
      <Route path="/loans/:id" element={<LoanDetailPage />} />
      <Route path="/loans/:id/repay" element={<RepaymentPage />} />
    </Routes>
  );
}

export default App; 