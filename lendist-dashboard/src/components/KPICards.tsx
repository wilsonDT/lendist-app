import React from 'react';
import { useDashboardSummary } from '../hooks/useDashboard';

export default function KPICards() {
  const { data: summary, isLoading, error } = useDashboardSummary();

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card p-6 rounded-lg shadow">
          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-muted rounded w-1/2 mt-2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 mb-6 rounded">
      <p className="font-bold">Error</p>
      <p>Could not load dashboard data. Please try refreshing the page.</p>
    </div>
  );

  if (!summary) return null;

  // Ensure values exist before formatting
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '₱0';
    return `₱${value.toLocaleString()}`;
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString();
  };

  const kpiData = [
    { 
      title: '`Total Loans', 
      value: formatCurrency(summary.total_loans_amount), 
      change: `${summary.loans_change || 0}%`, 
      status: (summary.loans_change || 0) >= 0 ? 'up' : 'down' 
    },
    { 
      title: 'Active Borrowers', 
      value: formatNumber(summary.active_borrowers), 
      change: `${summary.borrowers_change || 0}%`, 
      status: (summary.borrowers_change || 0) >= 0 ? 'up' : 'down' 
    },
    { 
      title: 'Due Today', 
      value: formatCurrency(summary.due_today), 
      change: '', 
      status: 'neutral' 
    },
    { 
      title: 'Overdue', 
      value: formatCurrency(summary.overdue_amount), 
      change: '', 
      status: 'neutral' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <div key={index} className="bg-card p-6 rounded-lg shadow">
          <h3 className="text-muted-foreground text-sm font-medium">{kpi.title}</h3>
          <p className="text-2xl font-bold mt-2 text-card-foreground">{kpi.value}</p>
          {kpi.change && (
            <div className={`mt-2 flex items-center text-sm ${
              kpi.status === 'up' ? 'text-green-500' : 
              kpi.status === 'down' ? 'text-red-500' : 'text-muted-foreground'
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