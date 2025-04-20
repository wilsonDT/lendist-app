import { useQuery, useMutation } from '@tanstack/react-query';
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
  email?: string;
  address?: string;
}

export function useBorrowers() {
  return useQuery<Borrower[]>(['borrowers'], () => api.get('/borrowers').then(res => res.data));
}

export function useBorrower(id: number) {
  return useQuery<Borrower>(
    ['borrower', id], 
    () => api.get(`/borrowers/${id}`).then(res => res.data),
    {
      enabled: !!id
    }
  );
}

export function useCreateBorrower() {
  return useMutation<Borrower, Error, { name: string; mobile?: string; email?: string; address?: string }>(
    (payload) => api.post('/borrowers', payload).then(res => res.data)
  );
} 