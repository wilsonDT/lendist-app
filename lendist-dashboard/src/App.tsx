import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import BorrowersPage from './pages/BorrowersPage';
import LoansPage from './pages/LoansPage';
import LoanDetailPage from './pages/LoanDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/borrowers" element={<BorrowersPage />} />
      <Route path="/loans" element={<LoansPage />} />
      <Route path="/loans/:id" element={<LoanDetailPage />} />
    </Routes>
  );
}

export default App; 