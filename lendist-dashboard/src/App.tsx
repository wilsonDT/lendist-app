import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import DashboardPage from './pages/DashboardPage';
import BorrowersPage from './pages/BorrowersPage';
import LoansPage from './pages/LoansPage';
import LoanDetailPage from './pages/LoanDetailPage';
import RepaymentPage from './pages/RepaymentPage';

// Component to protect routes
const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Component for public routes (e.g., login, register)
// Redirects to dashboard if user is already logged in
const PublicRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return user ? <Navigate to="/" replace /> : <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} /> 
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/borrowers" element={<BorrowersPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/loans/:id" element={<LoanDetailPage />} />
          <Route path="/loans/:id/repay" element={<RepaymentPage />} />
        </Route>

        {/* You might want a 404 page as well */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App; 