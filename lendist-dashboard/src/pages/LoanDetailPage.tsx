import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PaymentCollector from '../components/PaymentCollector';
import { useLoan } from '../hooks/useLoans';
import { usePaymentsByLoan, Payment } from '../hooks/usePayments';
import { format } from 'date-fns';

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const loanId = parseInt(id || '0');
  
  const { data: loan, isLoading: isLoadingLoan, error: loanError } = useLoan(loanId);
  const { data: payments, isLoading: isLoadingPayments, error: paymentsError } = usePaymentsByLoan(loanId);
  
  const isLoading = isLoadingLoan || isLoadingPayments;
  const error = loanError || paymentsError;
  
  if (isLoading) return <div className="p-4">Loading loan details...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading loan details</div>;
  if (!loan) return <div className="p-4">Loan not found</div>;
  
  // Calculate loan term in a readable format
  const loanTerm = `${loan.term_units} ${loan.term_frequency.toLowerCase()}${loan.term_units > 1 ? 's' : ''}`;
  
  // Find next payment
  const sortedPayments = [...(payments || [])].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  const nextPayment = sortedPayments.find(p => p.amount_paid < p.amount_due);
  const nextPaymentAmount = nextPayment 
    ? nextPayment.amount_due - nextPayment.amount_paid 
    : 0;
  
  // Calculate remaining principal
  const totalPaid = (payments || []).reduce((sum, payment) => sum + payment.amount_paid, 0);
  const remainingAmount = loan.principal - totalPaid;

  // Get payment status
  const getPaymentStatus = (payment: Payment) => {
    if (payment.amount_paid >= payment.amount_due) return 'paid';
    if (new Date(payment.due_date) < new Date()) return 'overdue';
    return 'pending';
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Link to="/loans" className="text-blue-600 hover:text-blue-800 mr-2">
          <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Loans
        </Link>
        <h1 className="text-2xl font-bold ml-4">Loan Details</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Loan Info */}
        <div className="col-span-2 bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Loan #{loan.id}</h2>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
              active
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm text-gray-500">Borrower ID</h3>
              <Link to={`/borrowers/${loan.borrower_id}`} className="text-blue-600 hover:text-blue-800">
                Borrower #{loan.borrower_id}
              </Link>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Loan Amount</h3>
              <p className="font-semibold">₱{loan.principal}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Issue Date</h3>
              <p>{format(new Date(loan.start_date), 'yyyy-MM-dd')}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Term</h3>
              <p>{loanTerm}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Interest Rate</h3>
              <p>{loan.interest_rate_percent}%</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Remaining Amount</h3>
              <p className="font-semibold">₱{remainingAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Due
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments && payments.map((payment) => {
                  const status = getPaymentStatus(payment);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{format(new Date(payment.due_date), 'yyyy-MM-dd')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₱{payment.amount_due.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₱{payment.amount_paid.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Payment Collector */}
        <div className="bg-white shadow rounded-lg p-6 h-fit">
          <PaymentCollector loanId={loan.id} nextPaymentAmount={nextPaymentAmount} />
        </div>
      </div>
    </div>
  );
} 