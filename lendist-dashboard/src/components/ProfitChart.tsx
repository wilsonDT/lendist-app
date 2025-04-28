import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  TooltipProps
} from 'recharts';
import { useExpectedProfit, ExpectedProfitData } from '../hooks/useDashboard';

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-2 border border-border shadow-sm rounded-md">
        <p className="font-medium text-card-foreground">{`₱${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export default function ProfitChart() {
  const { data, isLoading, error } = useExpectedProfit(12);
  
  if (isLoading) return (
    <div className="bg-card p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium mb-4">Expected Monthly Profit</h2>
      <div className="animate-pulse">
        <div className="h-64 bg-muted rounded"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-card p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium mb-4">Expected Monthly Profit</h2>
      <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded">
        <p className="font-bold">Error</p>
        <p>Could not load profit data. Please try refreshing the page.</p>
      </div>
    </div>
  );
  
  if (!data || data.length === 0) return (
    <div className="bg-card p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium mb-4">Expected Monthly Profit</h2>
      <p className="text-muted-foreground">No profit data available.</p>
    </div>
  );
  
  // Format data for the chart
  const chartData = data.map((item: ExpectedProfitData) => ({
    month: item.month.split(' ')[0].substring(0, 3), // Get first 3 letters of month name
    profit: item.expected_profit,
    fullMonth: item.month
  }));
  
  return (
    <div className="bg-card p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium mb-4">Expected Monthly Profit</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#374151' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="profit" 
              name="Expected Profit" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Projected profit from loan interest for the next 12 months
      </p>
    </div>
  );
} 