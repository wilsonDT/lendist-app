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
  interest_cycle?: string;
  start_date: string;
  created_at: string;
  borrower_name?: string;
  status: string; // active, completed, defaulted, cancelled
}

export function useLoans() {
  return useQuery<Loan[], Error>(['loans'], () => api.get('/loans').then(res => res.data));
}

export const useLoan = (id: number) => {
  console.log("useLoan hook called with ID:", id, "type:", typeof id);
  
  return useQuery<Loan, Error>(
    ['loan', id],
    async () => {
      // Skip the API call if the ID is invalid
      if (!id || id <= 0) {
        console.error("Invalid loan ID:", id);
        return Promise.reject(new Error("Invalid loan ID"));
      }
      
      try {
        console.log(`Fetching loan with ID: ${id}`);
        const response = await api.get(`/loans/${id}`);
        console.log("Loan fetch response:", response.data);
        return response.data;
      } catch (error) {
        console.error(`Error fetching loan with ID ${id}:`, error);
        throw error;
      }
    },
    {
      enabled: !!id && id > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1, // Only retry once
    }
  );
};

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

// Add mutation to update loan status
export function useUpdateLoanStatus() {
  const queryClient = useQueryClient();
  
  interface UpdateLoanStatusPayload {
    loanId: number;
    status: string; // 'active', 'completed', 'defaulted', 'cancelled'
  }
  
  return useMutation<Loan, Error, UpdateLoanStatusPayload>(
    ({ loanId, status }) => api.patch(`/loans/${loanId}/status`, { status }).then(res => res.data),
    {
      onSuccess: (data) => {
        // Invalidate and refetch loans queries to update UI
        queryClient.invalidateQueries(['loans']);
        queryClient.invalidateQueries(['loan', data.id]);
        queryClient.invalidateQueries(['dashboardSummary']);
      }
    }
  );
} 