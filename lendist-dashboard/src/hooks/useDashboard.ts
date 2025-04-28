import { useQuery } from '@tanstack/react-query';
import { api } from '../api/useApi';
import { AxiosResponse } from 'axios';

interface DashboardSummary {
  active_borrowers: number;
  total_loans_amount: number;
  due_today: number;
  overdue_amount: number;
  loans_change: number;
  borrowers_change: number;
}

export interface ExpectedProfitData {
  month: string;
  month_key: string;
  expected_profit: number;
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary, Error>(['dashboardSummary'], 
    async () => {
      try {
        const response: AxiosResponse<DashboardSummary> = await api.get('/dashboard/summary');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
        throw error;
      }
    },
    {
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
      retry: 3,
      staleTime: 1000 * 60, // Consider data stale after 1 minute
    }
  );
}

export function useExpectedProfit(months: number = 12) {
  return useQuery<ExpectedProfitData[], Error>(
    ['expectedProfit', months],
    async () => {
      try {
        const response: AxiosResponse<ExpectedProfitData[]> = await api.get('/dashboard/expected-profit', {
          params: { months }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch expected profit data:', error);
        throw error;
      }
    },
    {
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
      retry: 3,
      staleTime: 1000 * 60, // Consider data stale after 1 minute
    }
  );
} 