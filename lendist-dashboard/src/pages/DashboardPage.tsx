import React from 'react';
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import KPICards from '../components/KPICards';
import AlertsTab from '../components/AlertsTab';
import ProfitChart from '../components/ProfitChart';

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Dashboard" />
        <main className="p-6">
          <KPICards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProfitChart />
            </div>
            <div>
              <AlertsTab />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 