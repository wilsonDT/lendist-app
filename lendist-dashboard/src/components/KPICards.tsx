import React from 'react';
import { useDashboardSummary } from '../hooks/useDashboard';

export default function KPICards() {
  const { data: summary, isLoading, error } = useDashboardSummary();

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-gray-100 p-6 rounded-lg h-28"></div>
    ))}
  </div>;

  if (error) return <div className="text-red-500">Error loading dashboard data</div>;
  if (!summary) return null;

  const kpiData = [
    { title: 'Total Loans', value: `₱${summary.total_loans_amount || 0}`, change: summary.loans_change || '0%', status: summary.loans_change >= 0 ? 'up' : 'down' },
    { title: 'Active Borrowers', value: summary.active_borrowers || 0, change: summary.borrowers_change || '0%', status: summary.borrowers_change >= 0 ? 'up' : 'down' },
    { title: 'Due Today', value: `₱${summary.due_today || 0}`, change: '', status: 'neutral' },
    { title: 'Overdue', value: `₱${summary.overdue_amount || 0}`, change: '', status: 'neutral' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">{kpi.title}</h3>
          <p className="text-2xl font-bold mt-2">{kpi.value}</p>
          {kpi.change && (
            <div className={`mt-2 flex items-center text-sm ${
              kpi.status === 'up' ? 'text-green-500' : 
              kpi.status === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              <span>{kpi.change}</span>
              {kpi.status !== 'neutral' && (
                <svg 
                  className="w-4 h-4 ml-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {kpi.status === 'up' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  )}
                </svg>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 