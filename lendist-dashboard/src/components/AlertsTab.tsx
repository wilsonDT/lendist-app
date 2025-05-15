import React from 'react';
import { useReminders } from '../hooks/useReminders';

export default function AlertsTab() {
  const { data: reminders, isLoading, error } = useReminders();
  
  if (isLoading) return (
    <div className="bg-card rounded-lg shadow p-6 mt-6 animate-pulse">
      <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-md mb-3"></div>
      ))}
    </div>
  );
  
  if (error) return (
    <div className="bg-card rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Recent Alerts</h2>
      <p className="text-destructive">Error loading reminders</p>
    </div>
  );
  
  if (!reminders || reminders.length === 0) return (
    <div className="bg-card rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Recent Alerts</h2>
      <p className="text-muted-foreground">No reminders for today</p>
    </div>
  );

  return (
    <div className="bg-card rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Today&apos;s Reminders</h2>
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div 
            key={reminder.id}
            className={`p-4 rounded-md flex items-start ${
              reminder.type === 'overdue' 
                ? 'bg-destructive/10 border-l-4 border-destructive' 
                : reminder.type === 'due_today'
                ? 'bg-amber-100 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500' 
                : 'bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500'
            }`}
          >
            <div className="flex-1">
              <p className="font-medium text-card-foreground">{reminder.message}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {reminder.borrower_name} - Loan #{reminder.loan_id}
              </p>
            </div>
            <button className="text-muted-foreground hover:text-card-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button className="mt-4 text-primary hover:text-primary/80 font-medium text-sm flex items-center">
        View all reminders
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
} 