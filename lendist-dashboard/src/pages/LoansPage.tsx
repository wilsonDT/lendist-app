import React from 'react';
import LoanList from '../components/LoanList';

export default function LoansPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Loans</h1>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Loan
        </button>
      </div>
      <LoanList />
    </div>
  );
} 