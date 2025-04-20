import React from 'react';
import KPICards from '../components/KPICards';
import AlertsTab from '../components/AlertsTab';

export default function DashboardPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <KPICards />
      <AlertsTab />
    </div>
  );
} 