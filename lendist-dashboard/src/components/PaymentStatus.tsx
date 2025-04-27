import React from "react";
import { Badge } from "./ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

// Interface matching the Payment interface from the app
interface Payment {
  id: number;
  loan_id: number;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  paid_at: string | null;
}

interface PaymentStatusProps {
  payment: Payment;
}

export function PaymentStatus({ payment }: PaymentStatusProps) {
  const isPaid = payment.paid_at && payment.amount_paid >= payment.amount_due;
  const isPartiallyPaid = payment.paid_at && payment.amount_paid > 0 && payment.amount_paid < payment.amount_due;
  const isOverdue = !payment.paid_at && new Date(payment.due_date) < new Date();
  
  if (isPaid) {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Paid
      </Badge>
    );
  }
  
  if (isPartiallyPaid) {
    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
        <Clock className="h-3 w-3 mr-1" />
        Partially Paid
      </Badge>
    );
  }
  
  if (isOverdue) {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
        <AlertCircle className="h-3 w-3 mr-1" />
        Overdue
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
      Upcoming
    </Badge>
  );
} 