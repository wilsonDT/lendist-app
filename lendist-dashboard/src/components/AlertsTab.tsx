import React from 'react';
import { useReminders } from '../hooks/useReminders';

export default function AlertsTab() {
  const { data: reminders, isLoading, error } = useReminders();
  
  if (isLoading) return <div className="bg-white rounded-lg shadow p-6 mt-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded-md mb-3"></div>
    ))}
  </div>;
  
  if (error) return <div className="bg-white rounded-lg shadow p-6 mt-6">
    <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
    <p className="text-red-500">Error loading reminders</p>
  </div>;
  
  if (!reminders || reminders.length === 0) return <div className="bg-white rounded-lg shadow p-6 mt-6">
    <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
    <p className="text-gray-500">No reminders for today</p>
  </div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Today's Reminders</h2>
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div 
            key={reminder.id}
            className={`p-4 rounded-md flex items-start ${
              reminder.type === 'overdue' 
                ? 'bg-red-50 border-l-4 border-red-400' 
                : reminder.type === 'due_today'
                ? 'bg-yellow-50 border-l-4 border-yellow-400'
                : 'bg-blue-50 border-l-4 border-blue-400'
            }`}
          >
            <div className="flex-1">
              <p className="font-medium">{reminder.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reminder.borrower_name} - Loan #{reminder.loan_id}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
        View all reminders
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
} 