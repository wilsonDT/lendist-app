import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/useApi';

export interface Loan {
  id: number;
  borrower_id: number;
  principal: number;
  interest_rate_percent: number;
  term_units: number;
  term_frequency: string;
  repayment_type: string;
  start_date: string;
  created_at: string;
  borrower_name?: string;
}

export function useLoans() {
  return useQuery<Loan[], Error>(['loans'], () => api.get('/loans').then(res => res.data));
}

export function useLoan(id: number) {
  return useQuery<Loan, Error>(
    ['loan', id], 
    () => api.get(`/loans/${id}`).then(res => res.data),
    {
      enabled: !!id
    }
  );
}

export function useLoansByBorrower(borrowerId: number) {
  return useQuery<Loan[], Error>(
    ['loans', 'borrower', borrowerId], 
    () => api.get(`/loans/borrower/${borrowerId}`).then(res => res.data),
    {
      enabled: !!borrowerId
    }
  );
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  
  interface LoanCreatePayload {
    borrower_id: number;
    principal: number;
    interest_rate_percent: number;
    term_units: number;
    term_frequency: string;
    repayment_type: string;
    start_date: string;
  }
  
  return useMutation<Loan, Error, LoanCreatePayload>(
    (payload) => api.post('/loans', payload).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['loans']);
        queryClient.invalidateQueries(['dashboardSummary']);
      }
    }
  );
} 