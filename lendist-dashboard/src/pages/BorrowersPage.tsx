import React from 'react';
import BorrowerList from '../components/BorrowerList';
import NewBorrowerForm from '../components/NewBorrowerForm';

export default function BorrowersPage() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Borrowers</h1>
        <NewBorrowerForm />
      </div>
      <BorrowerList />
    </div>
  );
} 