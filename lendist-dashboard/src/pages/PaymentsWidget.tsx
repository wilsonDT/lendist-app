import React from 'react';

export default function PaymentsWidget() {
  // Mock data for recent payments
  const recentPayments = [
    { id: 1, borrowerName: 'John Smith', loanId: 1, amount: '$275', date: '2023-05-15', method: 'cash' },
    { id: 2, borrowerName: 'Maria Rodriguez', loanId: 3, amount: '$200', date: '2023-05-10', method: 'bank_transfer' },
    { id: 3, borrowerName: 'David Johnson', loanId: 4, amount: '$350', date: '2023-05-05', method: 'mobile_money' },
    { id: 4, borrowerName: 'Sarah Williams', loanId: 5, amount: '$150', date: '2023-05-01', method: 'cash' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Payments</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrower
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loan ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.borrowerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">#{payment.loanId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{payment.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.method === 'cash' 
                      ? 'bg-green-100 text-green-800' 
                      : payment.method === 'bank_transfer'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {payment.method.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 