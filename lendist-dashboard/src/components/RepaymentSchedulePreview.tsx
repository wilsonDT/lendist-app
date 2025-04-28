import { useMemo } from "react";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Badge } from "./ui/badge";

interface RepaymentSchedulePreviewProps {
  principal: number;
  interestRate: number;
  termUnits: number;
  frequency: string;
  repaymentType: string;
  interestCycle: string;
  startDate: Date | undefined;
}

export function RepaymentSchedulePreview({
  principal,
  interestRate,
  termUnits,
  frequency,
  repaymentType,
  interestCycle,
  startDate,
}: RepaymentSchedulePreviewProps) {
  // Don't calculate if any required field is missing
  const isDataComplete = !!principal && !!interestRate && !!termUnits && !!startDate;

  const repaymentSchedule = useMemo(() => {
    if (!isDataComplete) return [];

    const payments = [];
    let currentDate = startDate as Date;

    // Convert to proper frequency in days
    const getNextPaymentDate = (currentDate: Date): Date => {
      switch (frequency.toLowerCase()) {
        case "daily":
          return addDays(currentDate, 1);
        case "weekly":
          return addWeeks(currentDate, 1);
        case "monthly":
          return addMonths(currentDate, 1);
        case "quarterly":
          return addMonths(currentDate, 3);
        case "yearly":
          return addYears(currentDate, 1);
        default:
          return addMonths(currentDate, 1); // Default to monthly
      }
    };

    // Handle one-time interest vs other interest cycles
    const isOneTimeInterest = interestCycle.toLowerCase() === "one-time";
    
    // Calculate annual interest rate equivalent based on the interest cycle
    // Only used for recurring interest types (not one-time)
    const getAnnualizedInterestRate = (): number => {
      if (isOneTimeInterest) {
        return interestRate; // Just return the rate for one-time interest
      }
      
      switch (interestCycle.toLowerCase()) {
        case "daily":
          return interestRate * 365; // Daily interest to annual
        case "weekly":
          return interestRate * 52; // Weekly interest to annual
        case "monthly":
          return interestRate * 12; // Monthly interest to annual
        case "yearly":
          return interestRate; // Already annual
        default:
          return interestRate; // Default to annual
      }
    };
    
    // Get periodic interest rate based on payment frequency
    const getPeriodicInterestRate = (): number => {
      // For one-time interest, we distribute it evenly across all payments
      if (isOneTimeInterest) {
        return interestRate / termUnits;
      }
      
      // For recurring interest, we calculate the periodic rate
      const annualRate = getAnnualizedInterestRate();
      
      switch (frequency.toLowerCase()) {
        case "daily":
          return annualRate / 365;
        case "weekly":
          return annualRate / 52;
        case "monthly":
          return annualRate / 12;
        case "quarterly":
          return annualRate / 4;
        case "yearly":
          return annualRate;
        default:
          return annualRate / 12; // Default to monthly
      }
    };
    
    // Get the periodic interest rate for payment calculations
    const periodicRate = getPeriodicInterestRate();

    if (repaymentType.toLowerCase() === "flat") {
      // Flat loans: interest is calculated on the full principal amount,
      // and the principal is distributed evenly across all payments
      
      // If it's one-time interest and there's only one term, add all interest to the first payment
      if (isOneTimeInterest && termUnits === 1) {
        const fullInterest = (principal * interestRate) / 100;
        const principalPerPeriod = principal;
        
        payments.push({
          id: 1,
          dueDate: new Date(currentDate),
          amount: parseFloat((principalPerPeriod + fullInterest).toFixed(2)),
          principal: principalPerPeriod,
          interest: fullInterest,
          remainingPrincipal: 0
        });
      } else {
        // Normal flat interest calculation (distributed across terms)
        const interestPerPeriod = (principal * periodicRate) / 100;
        const principalPerPeriod = principal / termUnits;
        
        for (let i = 0; i < termUnits; i++) {
          const amount = principalPerPeriod + interestPerPeriod;
          
          payments.push({
            id: i + 1,
            dueDate: new Date(currentDate),
            amount: parseFloat(amount.toFixed(2)),
            principal: principalPerPeriod,
            interest: interestPerPeriod,
            remainingPrincipal: parseFloat((principal - principalPerPeriod * (i + 1)).toFixed(2))
          });
          
          currentDate = getNextPaymentDate(currentDate);
        }
      }
    } else {
      // Amortized loans: equal payments including both principal and interest
      
      // For one-time interest with amortized loans, treat it specially
      if (isOneTimeInterest) {
        const totalInterest = (principal * interestRate) / 100;
        const totalAmount = principal + totalInterest;
        const paymentAmount = totalAmount / termUnits;
        let remainingTotal = totalAmount;
        let remainingPrincipal = principal;
        
        for (let i = 0; i < termUnits; i++) {
          // Calculate proportion of interest vs principal for this payment
          const proportion = remainingPrincipal / remainingTotal;
          const principalPayment = Math.min(paymentAmount * proportion, remainingPrincipal);
          const interestPayment = paymentAmount - principalPayment;
          
          remainingPrincipal -= principalPayment;
          remainingTotal -= paymentAmount;
          
          payments.push({
            id: i + 1,
            dueDate: new Date(currentDate),
            amount: parseFloat(paymentAmount.toFixed(2)),
            principal: parseFloat(principalPayment.toFixed(2)),
            interest: parseFloat(interestPayment.toFixed(2)),
            remainingPrincipal: parseFloat(remainingPrincipal.toFixed(2)),
          });
          
          currentDate = getNextPaymentDate(currentDate);
        }
      } else {
        // Standard amortized calculation for recurring interest
        const rate = periodicRate / 100;
        const payment = principal * rate / (1 - Math.pow(1 + rate, -termUnits));
        
        let remainingPrincipal = principal;
        
        for (let i = 0; i < termUnits; i++) {
          const interestPayment = remainingPrincipal * rate;
          const principalPayment = payment - interestPayment;
          
          remainingPrincipal -= principalPayment;
          
          payments.push({
            id: i + 1,
            dueDate: new Date(currentDate),
            amount: parseFloat(payment.toFixed(2)),
            principal: parseFloat(principalPayment.toFixed(2)),
            interest: parseFloat(interestPayment.toFixed(2)),
            remainingPrincipal: parseFloat(remainingPrincipal.toFixed(2)),
          });
          
          currentDate = getNextPaymentDate(currentDate);
        }
      }
    }

    return payments;
  }, [principal, interestRate, interestCycle, termUnits, frequency, repaymentType, startDate, isDataComplete]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (!isDataComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Repayment Schedule Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Fill in all loan details to see a payment schedule preview.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Repayment Schedule Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repaymentSchedule.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{format(payment.dueDate, "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{formatCurrency(payment.principal)}</TableCell>
                  <TableCell>{formatCurrency(payment.interest)}</TableCell>
                  <TableCell>{formatCurrency(payment.remainingPrincipal || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Note: This is a preview only. Actual payment schedule may vary.
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 