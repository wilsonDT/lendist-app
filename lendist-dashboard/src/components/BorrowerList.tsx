import React from 'react';
import { Link } from 'react-router-dom';
import { useBorrowers } from '../hooks/useBorrowers';

export default function BorrowerList() {
  const { data: borrowers, isLoading, error } = useBorrowers();
  
  if (isLoading) return <div className="text-center py-4">Loading borrowers...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error loading borrowers</div>;
  if (!borrowers || borrowers.length === 0) return <div className="text-center py-4">No borrowers found</div>;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mobile
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Loans
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {borrowers.map((borrower) => (
            <tr key={borrower.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{borrower.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{borrower.mobile}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{borrower.active_loans_count || 0}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">₱{borrower.total_principal || 0}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/borrowers/${borrower.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                  View
                </Link>
                <Link to={`/borrowers/${borrower.id}/edit`} className="text-gray-600 hover:text-gray-900">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 