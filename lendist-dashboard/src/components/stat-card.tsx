import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, description, icon: Icon, iconColor, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className={cn("p-2 rounded-full bg-secondary/50", iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
        {trend && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center">
            <span className={cn("flex items-center mr-1", trend.isPositive ? "text-emerald-500" : "text-rose-500")}>
              {trend.value}
            </span>
            from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
} 