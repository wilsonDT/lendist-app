import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import KPICards from '../components/KPICards';
import AlertsTab from '../components/AlertsTab';
import ProfitChart from '../components/ProfitChart';

export default function DashboardPage() {
  const { user, signOut, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If there's no user, ProtectedRoute should have redirected. 
  // But as a fallback or if used outside ProtectedRoute:
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Redirecting to login...</p> 
        {/* Or render a Link to login, though ProtectedRoute handles this case better */}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Dashboard" />
        <main className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
                <p className="text-lg">Welcome back, {user.email}!</p>
                {/* <p className="text-sm text-muted-foreground">User ID: {user.id}</p> */}
            </div>
            <Button onClick={signOut} variant="outline">Sign Out</Button>
          </div>
          <KPICards />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
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