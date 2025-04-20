import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentPayments } from '../hooks/usePayments';
import { format } from 'date-fns';

export default function PaymentsWidget() {
  const { data: recentPayments, isLoading, error } = useRecentPayments(5);

  // Show loading state
  if (isLoading) return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Payments</h1>
      <div className="bg-card shadow-md rounded-lg overflow-hidden animate-pulse">
        <div className="p-4">
          <div className="h-8 bg-muted rounded mb-4 w-full"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-md mb-3"></div>
          ))}
        </div>
      </div>
    </div>
  );

  // Show error state
  if (error) return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Payments</h1>
      <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded">
        <p className="font-bold">Error</p>
        <p>Could not load payment data. Please try refreshing the page.</p>
      </div>
    </div>
  );

  // Show empty state
  if (!recentPayments || recentPayments.length === 0) return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Payments</h1>
      <div className="bg-card shadow-md rounded-lg p-6 text-center text-muted-foreground">
        No recent payments found.
      </div>
    </div>
  );

  // Format payment date
  const formatPaymentDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Payments</h1>
      
      <div className="bg-card shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Borrower
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Loan ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Method
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-card-foreground">
                    <Link to={`/borrowers/${payment.borrower_id}`} className="hover:text-primary">
                      {payment.borrower_name}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">
                    <Link to={`/loans/${payment.loan_id}`} className="hover:text-primary">
                      #{payment.loan_id}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-card-foreground">₱{payment.amount_paid.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{formatPaymentDate(payment.payment_date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.payment_method === 'cash' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : payment.payment_method === 'bank_transfer'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                  }`}>
                    {payment.payment_method.replace('_', ' ')}
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