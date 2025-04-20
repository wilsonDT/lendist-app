import { CreditCard, DollarSign, Users, X } from "lucide-react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatCard } from "../components/stat-card";

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Dashboard" />
        <main className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Loans"
              value="₱260,000"
              icon={DollarSign}
              iconColor="text-emerald-500"
              trend={{
                value: "↑ 5%",
                isPositive: true,
              }}
            />
            <StatCard
              title="Active Borrowers"
              value="2"
              icon={Users}
              iconColor="text-violet-500"
              trend={{
                value: "↑ 2",
                isPositive: true,
              }}
            />
            <StatCard
              title="Due Today"
              value="₱2,690.27"
              description="1 payment due"
              icon={CreditCard}
              iconColor="text-amber-500"
            />
            <StatCard
              title="Overdue"
              value="₱0"
              description="No overdue payments"
              icon={CreditCard}
              iconColor="text-rose-500"
            />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Today's Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border/40 bg-card/50 p-4 relative">
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6 hover:bg-background/80">
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="font-medium">Payment of ₱2,690.27 is due today</div>
                  <div className="text-sm text-muted-foreground mt-1">John Smith - Loan #6</div>
                </div>
                <Button variant="link" className="mt-4 px-0">
                  View all reminders
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-sky-500" />
                    <div>
                      <p className="font-medium">New loan created</p>
                      <p className="text-sm text-muted-foreground">John Smith - ₱10,000</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="font-medium">Payment received</p>
                      <p className="text-sm text-muted-foreground">Juan Dela Cruz - ₱5,000</p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 