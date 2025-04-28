import React from 'react';
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import KPICards from '../components/KPICards';
import AlertsTab from '../components/AlertsTab';

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Dashboard" />
        <main className="p-6">
          <KPICards />
          <AlertsTab />
        </main>
      </div>
    </div>
  );
} 