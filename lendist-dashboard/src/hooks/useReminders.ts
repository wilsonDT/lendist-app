import { useQuery } from '@tanstack/react-query';
import { api } from '../api/useApi';
import { AxiosResponse } from 'axios';

interface Reminder {
  id: number;
  loan_id: number;
  borrower_name: string;
  message: string;
  type: 'overdue' | 'due_today' | 'upcoming';
}

export function useReminders() {
  return useQuery<Reminder[], Error>(['remindersToday'], 
    async () => {
      try {
        const response: AxiosResponse<Reminder[]> = await api.get('/reminders/today');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch reminders:', error);
        throw error;
      }
    },
    {
      refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
      retry: 3,
      staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    }
  );
} 