import { useQuery } from '@tanstack/react-query';
import { api } from '../api/useApi';

export function useDashboardSummary() {
  return useQuery(['dashboardSummary'], () => 
    api.get('/dashboard/summary').then(res => res.data)
  );
} 