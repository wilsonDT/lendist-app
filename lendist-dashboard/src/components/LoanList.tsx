import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLoans, Loan } from '../hooks/useLoans';
import { useBorrowers, Borrower } from '../hooks/useBorrowers';

interface LoanListProps {
  borrowerId?: number;
}

export default function LoanList({ borrowerId }: LoanListProps) {
  const { data: loans, isLoading: loansLoading, error: loansError } = useLoans();
  const { data: borrowers, isLoading: borrowersLoading } = useBorrowers();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'defaulted'>('all');
  
  const isLoading = loansLoading || borrowersLoading;
  const error = loansError;
  
  if (isLoading) return <div className="text-center py-4">Loading loans...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error loading loans</div>;
  if (!loans || loans.length === 0) return <div className="text-center py-4">No loans found</div>;

  // Filter loans by borrowerId and status
  const filteredLoans = useMemo(() => {
    let result = borrowerId 
      ? loans.filter(loan => loan.borrower_id === borrowerId)
      : loans;
      
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(loan => loan.status === statusFilter);
    }
    
    // Sort loans: active first, then others
    return [...result].sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return 0;
    });
  }, [loans, borrowerId, statusFilter]);
    
  if (filteredLoans.length === 0) return <div className="text-center py-4">No loans found matching the selected filters</div>;
  
  // Function to get borrower name from borrower ID
  const getBorrowerName = (borrowerId: number) => {
    if (!borrowers) return `Borrower #${borrowerId}`;
    const borrower = borrowers.find((b: Borrower) => b.id === borrowerId);
    return borrower ? borrower.name : `Borrower #${borrowerId}`;
  };

  // Function to get status display with capitalized first letter
  const getStatusDisplay = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Function to get status badge styling
  const getStatusBadgeStyle = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'defaulted':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Loan List</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setStatusFilter('all')} 
            className={`px-3 py-1 rounded ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setStatusFilter('active')} 
            className={`px-3 py-1 rounded ${statusFilter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusFilter('completed')} 
            className={`px-3 py-1 rounded ${statusFilter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {!borrowerId && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Term
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLoans.map((loan: Loan) => (
              <tr key={loan.id} className={`hover:bg-gray-50 ${loan.status === 'active' ? '' : 'opacity-70'}`}>
                {!borrowerId && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Link to={`/borrowers/${loan.borrower_id}`}>
                        {getBorrowerName(loan.borrower_id)}
                      </Link>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₱{loan.principal}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{loan.start_date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(loan.status || 'active')}`}>
                    {getStatusDisplay(loan.status || 'active')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {loan.term_units} {loan.term_frequency.toLowerCase()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/loans/${loan.id}`} className="text-blue-600 hover:text-blue-900">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 