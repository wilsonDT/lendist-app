import React from 'react';
import { useParams, Link } from 'react-router-dom';
import LoanList from '../../src/components/LoanList';
import { useBorrower } from '../hooks/useBorrowers';
import { format } from 'date-fns';

export default function BorrowerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const borrowerId = parseInt(id || '0');
  const { data: borrower, isLoading, error } = useBorrower(borrowerId);

  if (isLoading) return <div className="p-4">Loading borrower details...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading borrower details</div>;
  if (!borrower) return <div className="p-4">Borrower not found</div>;

  // Format the created_at date
  const formattedDate = borrower.created_at ? 
    format(new Date(borrower.created_at), 'MMMM d, yyyy') : 
    'Unknown';

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Borrower Details</h1>
        <Link to={`/borrowers/${borrower.id}/edit`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Edit Borrower
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{borrower.name}</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Mobile:</span> {borrower.mobile || 'Not provided'}
              </div>
              <div>
                <span className="text-gray-500">Email:</span> {borrower.email || 'Not provided'}
              </div>
              <div>
                <span className="text-gray-500">Address:</span> {borrower.address || 'Not provided'}
              </div>
              <div>
                <span className="text-gray-500">Member Since:</span> {formattedDate}
              </div>
            </div>
          </div>
          <div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Activity Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-semibold">{borrower.active_loans_count || 0}</div>
                  <div className="text-sm text-gray-500">Active Loans</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-semibold">₱{borrower.total_principal || 0}</div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-lg font-semibold">{borrower.total_loans || 0}</div>
                  <div className="text-sm text-gray-500">Total Loans</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-lg font-semibold">{borrower.repayment_rate || 0}%</div>
                  <div className="text-sm text-gray-500">Repayment Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Loans</h2>
      <LoanList borrowerId={borrower.id} />
    </div>
  );
} 