import { useQuery } from '@tanstack/react-query';
import { api } from '../api/useApi';

export function useReminders() {
  return useQuery(['remindersToday'], () => 
    api.get('/reminders/today').then(res => res.data)
  );
} 