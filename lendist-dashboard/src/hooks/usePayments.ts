import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../api/useApi';

export interface Payment {
  id: number;
  loan_id: number;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  paid_at: string | null;
}

export function usePaymentsByLoan(loanId: number) {
  return useQuery<Payment[]>(
    ['payments', loanId], 
    () => api.get(`/payments/loan/${loanId}`).then(res => res.data),
    {
      enabled: !!loanId
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
        queryClient.invalidateQueries(['payments', variables.loan_id]);
        queryClient.invalidateQueries(['dashboardSummary']);
      }
    }
  );
} 