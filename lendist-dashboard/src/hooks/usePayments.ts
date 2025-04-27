import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../api/useApi';
import { AxiosResponse } from 'axios';

export interface Payment {
  id: number;
  loan_id: number;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  paid_at: string | null;
}

export interface RecentPayment {
  id: number;
  loan_id: number;
  borrower_id: number;
  borrower_name: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
}

export function usePaymentsByLoan(loanId: number, recalculate: boolean = false) {
  return useQuery<Payment[], Error>(
    ['payments', 'loan', loanId, { recalculate }], 
    async () => {
      try {
        const response: AxiosResponse<Payment[]> = await api.get(`/payments/loan/${loanId}?recalculate=${recalculate}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch payments for loan ${loanId}:`, error);
        throw error;
      }
    },
    {
      enabled: !!loanId,
      staleTime: 1000 * 60 * 5,
    }
  );
}

export function useRecentPayments(limit: number = 10) {
  return useQuery<RecentPayment[], Error>(
    ['payments', 'recent', limit], 
    async () => {
      try {
        const response: AxiosResponse<RecentPayment[]> = await api.get(`/payments/recent/?limit=${limit}`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch recent payments:', error);
        throw error;
      }
    },
    {
      staleTime: 1000 * 60 * 5,
    }
  );
}

export function usePaymentsByBorrower(borrowerId: number) {
  return useQuery<RecentPayment[], Error>(
    ['payments', 'borrower', borrowerId],
    async () => {
      try {
        const response: AxiosResponse<RecentPayment[]> = await api.get(`/payments/borrower/${borrowerId}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch payments for borrower ${borrowerId}:`, error);
        return []; // Return empty array if API endpoint not implemented yet
      }
    },
    {
      enabled: !!borrowerId,
      staleTime: 1000 * 60 * 5,
    }
  );
}

export function useCollectPayment() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (payload: { loan_id: number; amount: number; date?: string }) => 
      api.post('/payments', payload).then(res => res.data),
    {
      onSuccess: (data, variables) => {
        // Invalidate loan data to refresh after payment
        queryClient.invalidateQueries(['loan', variables.loan_id]);
        queryClient.invalidateQueries(['loans']);
        queryClient.invalidateQueries(['payments', 'loan', variables.loan_id]);
        queryClient.invalidateQueries(['dashboardSummary']);
      }
    }
  );
}

// Add a mutation to recalculate a loan's payment schedule
export function useRecalculatePayments() {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, number>(
    (loanId: number) => api.post(`/payments/loan/${loanId}/recalculate`).then(res => res.data),
    {
      onSuccess: (data, loanId) => {
        // Invalidate related queries
        queryClient.invalidateQueries(['loan', loanId]);
        queryClient.invalidateQueries(['payments', 'loan', loanId]);
        queryClient.invalidateQueries(['loans']);
        queryClient.invalidateQueries(['dashboardSummary']);
      }
    }
  );
} 