import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/useApi';

export interface Borrower {
  id: number;
  name: string;
  mobile?: string;
  active_loans_count?: number;
  total_principal?: number;
  total_loans?: number;
  repayment_rate?: number;
  created_at: string;
}

export function useBorrowers() {
  return useQuery<Borrower[]>(['borrowers'], () => api.get('/borrowers/').then(res => res.data));
}

export function useBorrower(id: number) {
  return useQuery<Borrower>(
    ['borrower', id], 
    () => api.get(`/borrowers/${id}/`).then(res => res.data),
    {
      enabled: !!id
    }
  );
}

export function useCreateBorrower() {
  const queryClient = useQueryClient();
  
  // Only accept name and mobile in the payload since we've removed email and address
  return useMutation<Borrower, Error, { name: string; mobile: string }>(
    (payload) => api.post('/borrowers/', payload).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['borrowers']);
      },
      onError: (error) => {
        console.error('Failed to create borrower:', error);
      }
    }
  );
} 