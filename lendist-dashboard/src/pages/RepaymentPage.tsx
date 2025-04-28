import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Sidebar } from "../components/sidebar"
import { Header } from "../components/header"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { ArrowLeft, Calendar, DollarSign, CalendarCheck, User, Clock, CheckCircle2 } from "lucide-react"
import { useLoan } from "../hooks/useLoans"
import { usePaymentsByLoan } from "../hooks/usePayments"
import { api } from "../api/useApi"
import { formatCurrency } from "../lib/utils"
import { DatePicker } from "../components/ui/date-picker"
import { format, addDays, addWeeks, addMonths, addYears, parseISO } from "date-fns"
import { useCollectPayment, useUpdatePayment } from "../hooks/usePayments"
import { useToast } from "../components/ui/use-toast"

// Payment interface
interface Payment {
  id: number;
  loan_id: number;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  paid_at: string | null;
}

// Cache for borrower names
const borrowerCache = new Map<number, string>();

// Helper function to calculate next payment date based on term frequency
const calculateNextPaymentDate = (lastDueDate: Date, termFrequency: string): Date => {
  switch (termFrequency.toLowerCase()) {
    case 'daily':
      return addDays(lastDueDate, 1);
    case 'weekly':
      return addWeeks(lastDueDate, 1);
    case 'monthly':
      return addMonths(lastDueDate, 1);
    case 'quarterly':
      return addMonths(lastDueDate, 3);
    case 'yearly':
      return addYears(lastDueDate, 1);
    default:
      return addMonths(lastDueDate, 1); // Default to monthly
  }
};

// Helper function to calculate the first payment date based on loan start date
const calculateFirstPaymentDate = (startDate: Date, termFrequency: string): Date => {
  // The first payment date should be one term period after the start date
  return calculateNextPaymentDate(startDate, termFrequency);
};

// Add helper from LoanDetailPage to compute payments accurately
const calculatePaymentWithInterest = (
  principal: number,
  interestRate: number,
  terms: number,
  frequency: string,
  repaymentType: string,
  interestCycle: string
): number => {
  // Calculate annualized interest
  const getAnnualizedInterestRate = () => {
    switch (interestCycle.toLowerCase()) {
      case "one-time": return interestRate;
      case "daily": return interestRate * 365;
      case "weekly": return interestRate * 52;
      case "monthly": return interestRate * 12;
      default: return interestRate;
    }
  };
  const annualRate = getAnnualizedInterestRate();
  // periodic rate
  const rateMap: Record<string, number> = {
    daily: annualRate / 365,
    weekly: annualRate / 52,
    monthly: annualRate / 12,
    quarterly: annualRate / 4,
    yearly: annualRate
  };
  const periodicRate = (rateMap[frequency.toLowerCase()] ?? rateMap.monthly) / 100;
  if (repaymentType.toLowerCase() === "flat") {
    const interestPerPeriod = principal * periodicRate;
    return principal / terms + interestPerPeriod;
  }
  if (periodicRate === 0) return principal / terms;
  const num = periodicRate * Math.pow(1 + periodicRate, terms);
  const den = Math.pow(1 + periodicRate, terms) - 1;
  return principal * (num / den);
};

export default function RepaymentPage() {
  const navigate = useNavigate()
  const { id: loanId } = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const parsedLoanId = loanId ? (isNaN(Number(loanId)) ? 0 : Number(loanId)) : 0
  const { data: loan, isLoading } = useLoan(parsedLoanId)
  const { data: payments } = usePaymentsByLoan(parsedLoanId, true)
  
  const [borrowerName, setBorrowerName] = useState<string>("")
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [nextPaymentDue, setNextPaymentDue] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [nextPaymentDueDate, setNextPaymentDueDate] = useState<Date>(new Date())

  // Use the mutation hooks
  const collectPaymentMutation = useCollectPayment();
  const updatePaymentMutation = useUpdatePayment();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!loan) return;

      // Fetch borrower name
      if (borrowerCache.has(loan.borrower_id)) {
        setBorrowerName(borrowerCache.get(loan.borrower_id) || "");
      } else {
        try {
          const response = await api.get(`/borrowers/${loan.borrower_id}`);
          if (isMounted && response.data && response.data.name) {
            borrowerCache.set(loan.borrower_id, response.data.name);
            setBorrowerName(response.data.name);
          }
        } catch (error) {
          console.error("Error fetching borrower name:", error);
          if (isMounted) {
            setBorrowerName(`Borrower #${loan.borrower_id}`);
          }
        }
      }

      // Use the payments data from the hook which includes recalculated amounts
      if (isMounted && payments?.length) {
        // Find next unpaid or partially paid
        const nextPayment = payments.find(p => !p.paid_at || p.amount_paid === 0);
        const target = nextPayment || payments.find(p => p.amount_paid < p.amount_due);
        
        if (target) {
          setNextPaymentDue(target);
          setPaymentAmount((target.amount_due - (target.amount_paid || 0)).toString());
          
          // Set the payment date to the due date by default
          const dueDate = parseISO(target.due_date);
          setPaymentDate(dueDate);
          setNextPaymentDueDate(dueDate);
        } else {
          setNextPaymentDue(null);
          
          // Calculate the next payment date based on the last payment and term frequency
          let nextDate = new Date();
          if (payments.length > 0) {
            // Sort payments by due date (descending) to get the latest payment
            const sortedPayments = [...payments].sort((a, b) => 
              new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
            );
            
            const lastPayment = sortedPayments[0];
            const lastDueDate = parseISO(lastPayment.due_date);
            nextDate = calculateNextPaymentDate(lastDueDate, loan.term_frequency);
          } else {
            // If no payments, calculate first payment date from loan start date
            const startDate = parseISO(loan.start_date);
            // Use the helper to calculate the first payment date (one term after start date)
            nextDate = calculateFirstPaymentDate(startDate, loan.term_frequency);
          }
          
          setPaymentDate(nextDate);
          setNextPaymentDueDate(nextDate);
          
          // Use calculated payment from our first payment in the schedule for new payments
          const regularPayment = payments[0]?.amount_due || (loan.principal / loan.term_units);
          setPaymentAmount(regularPayment.toString());
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [loan, payments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loan || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (nextPaymentDue?.id) {
        // For existing payments, use the updatePaymentMutation
        const updatePayload = {
          paymentId: nextPaymentDue.id,
          loanId: loan.id,
          amount_paid: parseFloat(paymentAmount) + (nextPaymentDue.amount_paid || 0),
          paid_at: format(paymentDate, "yyyy-MM-dd'T'HH:mm:ss")
        };
        
        updatePaymentMutation.mutate(updatePayload, {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Payment updated successfully!",
              variant: "default"
            });
            navigate(`/loans/${loan.id}`);
          },
          onError: (error) => {
            console.error("Error updating payment:", error);
            toast({
              title: "Error",
              description: "Failed to update payment. Please try again.",
              variant: "destructive"
            });
            setIsSubmitting(false);
          }
        });
      } else {
        // For new payments, use the collectPaymentMutation
        const payload = {
          loan_id: loan.id,
          amount: parseFloat(paymentAmount),
          date: format(paymentDate, "yyyy-MM-dd'T'HH:mm:ss")
        };
    
        collectPaymentMutation.mutate(payload, {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Payment recorded successfully!",
              variant: "default"
            });
            navigate(`/loans/${loan.id}`);
          },
          onError: (error) => {
            console.error("Error recording payment:", error);
            toast({
              title: "Error",
              description: "Failed to record payment. Please try again.",
              variant: "destructive"
            });
            setIsSubmitting(false);
          }
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading || !loan) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Record Payment" />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <Button 
              variant="ghost" 
              className="flex items-center mb-6" 
              onClick={() => navigate(`/loans/${loanId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Loan Details
            </Button>
            <div className="flex h-full items-center justify-center">
              <p>Loading loan information...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header title="Record Payment" />
        <main className="p-6">
          <Button 
            variant="ghost" 
            className="flex items-center mb-6" 
            onClick={() => navigate(`/loans/${loanId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Loan Details
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Borrower Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Borrower</p>
                    <p className="font-medium">{borrowerName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Amount */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="font-medium">₱{formatCurrency(loan?.principal || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-medium">{loan.term_units} {loan.term_frequency.toLowerCase()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Record New Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {nextPaymentDue ? (
                  <div className="bg-card border border-border rounded-lg p-5 mb-4">
                    <h3 className="text-lg font-medium mb-3 flex items-center text-primary">
                      <Clock className="h-5 w-5 mr-2" />
                      {nextPaymentDue.paid_at ? "Partially Paid" : "Unpaid"} Payment
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium">{nextPaymentDue.due_date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-medium">₱{formatCurrency(nextPaymentDue.amount_due)}</p>
                      </div>
                      {nextPaymentDue.amount_paid > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">Previously Paid</p>
                          <p className="font-medium">₱{formatCurrency(nextPaymentDue.amount_paid)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining to Pay</p>
                        <p className="font-medium text-primary">₱{formatCurrency(nextPaymentDue.amount_due - (nextPaymentDue.amount_paid || 0))}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-5 mb-4">
                    <h3 className="text-lg font-medium mb-2 flex items-center text-primary">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      All scheduled payments complete
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      You can record an additional payment based on the loan terms.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Next Payment Date</p>
                        <p className="font-medium">{format(nextPaymentDueDate, "PPP")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Based on</p>
                        <p className="font-medium">{loan.term_frequency.toLowerCase()} payments</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-10"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <div className="flex">
                    <DatePicker
                      name="date"
                      placeholder="Select date"
                      value={paymentDate}
                      onChange={(date) => date && setPaymentDate(date)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/loans/${loan.id}`)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !paymentAmount || parseFloat(paymentAmount) <= 0}
                  >
                    {isSubmitting ? "Processing..." : "Record Payment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 