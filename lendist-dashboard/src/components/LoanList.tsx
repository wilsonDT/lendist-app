import React from 'react';
import { Link } from 'react-router-dom';
import { useLoans, Loan } from '../hooks/useLoans';
import { useBorrowers, Borrower } from '../hooks/useBorrowers';

interface LoanListProps {
  borrowerId?: number;
}

export default function LoanList({ borrowerId }: LoanListProps) {
  const { data: loans, isLoading: loansLoading, error: loansError } = useLoans();
  const { data: borrowers, isLoading: borrowersLoading } = useBorrowers();
  
  const isLoading = loansLoading || borrowersLoading;
  const error = loansError;
  
  if (isLoading) return <div className="text-center py-4">Loading loans...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error loading loans</div>;
  if (!loans || loans.length === 0) return <div className="text-center py-4">No loans found</div>;

  // Filter loans if borrowerId is provided
  const filteredLoans = borrowerId 
    ? loans.filter(loan => loan.borrower_id === borrowerId)
    : loans;
    
  if (filteredLoans.length === 0) return <div className="text-center py-4">No loans found for this borrower</div>;
  
  // Function to get borrower name from borrower ID
  const getBorrowerName = (borrowerId: number) => {
    if (!borrowers) return `Borrower #${borrowerId}`;
    const borrower = borrowers.find((b: Borrower) => b.id === borrowerId);
    return borrower ? borrower.name : `Borrower #${borrowerId}`;
  };

  return (
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
            <tr key={loan.id} className="hover:bg-gray-50">
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
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {loan.term_frequency.toLowerCase()}
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
  );
} 