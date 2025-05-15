import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Sidebar } from "../components/sidebar"
import { Header } from "../components/header"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { ArrowLeft, Calendar, CreditCard, DollarSign, User, Clock, FileText, CheckCircle2, PlusCircle, AlertCircle, RotateCw, RefreshCcw } from "lucide-react"
import { LoanDetailPageSkeleton } from "../components/skeleton-layout"
import { useLoan, useUpdateLoanStatus } from "../hooks/useLoans"
import { usePaymentsByLoan, useRecalculatePayments } from "../hooks/usePayments"
import { api } from "../api/useApi"
import { formatCurrency } from "../lib/utils"
import { useToast } from "../components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { PaymentStatus } from "../components/PaymentStatus"
import { useMutation } from "@tanstack/react-query"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Payment interface
interface Payment {
  id: number;
  loan_id: number;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  paid_at: string | null;
}

// Extend the Loan interface locally to include status
interface ExtendedLoan {
  id: number;
  borrower_id: number;
  principal: number;
  interest_rate_percent: number;
  term_units: number;
  term_frequency: string;
  repayment_type: string;
  interest_cycle?: string;
  start_date: string;
  created_at: string;
  borrower_name?: string;
  status?: string;
}

// Add a cache outside the component to prevent refetching the same borrower
const borrowerCache = new Map<number, string>();

// Add this near the borrowerCache
const paymentScheduleCache = new Map<number, any[]>();

// Helper function to capitalize first letter
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Add a helper function to calculate payment amount with interest
const calculatePaymentWithInterest = (principal: number, interestRate: number, terms: number, frequency: string = "monthly", repaymentType: string = "amortized", interestCycle: string = "yearly"): number => {
  // Debug logs
  console.log("Payment calculation with:", {
    principal,
    interestRate,
    terms, 
    frequency,
    repaymentType,
    interestCycle
  });
  
  // Calculate annual interest rate equivalent based on the interest cycle
  const getAnnualizedInterestRate = (): number => {
    switch (interestCycle.toLowerCase()) {
      case "one-time":
        return interestRate; // One-time interest
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
  
  // Get the periodic interest rate for calculations
  const periodicRate = getPeriodicInterestRate() / 100; // Convert percentage to decimal
  console.log("Periodic rate:", periodicRate);

  if (repaymentType.toLowerCase() === "flat") {
    // Flat loans: interest is calculated on the full principal amount,
    // and the principal is distributed evenly across all payments
    const interestPerPeriod = principal * periodicRate;
    const principalPerPeriod = principal / terms;
    
    const payment = principalPerPeriod + interestPerPeriod;
    console.log("Flat payment calculation:", {
      interestPerPeriod,
      principalPerPeriod,
      payment
    });
    return payment;
  } else {
    // Amortized loans: equal payments including both principal and interest
    // Use formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    if (periodicRate === 0) return principal / terms; // Handle zero interest case

    const numerator = periodicRate * Math.pow(1 + periodicRate, terms);
    const denominator = Math.pow(1 + periodicRate, terms) - 1;
    
    // Handle edge case to avoid division by zero
    if (denominator === 0) return principal / terms;
    
    const payment = principal * (numerator / denominator);
    console.log("Amortized payment calculation:", {
      numerator,
      denominator,
      payment
    });
    return payment;
  }
};

export default function LoanDetailPage() {
  const navigate = useNavigate()
  const location = useLocation() // Add this to detect navigation from payment page
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState("payment")
  const { toast } = useToast()
  
  // Log the ID to debug
  console.log("Loan ID from URL params:", id, "type:", typeof id)
  
  // Only parse if needed and ensure we have a valid ID
  const loanId = id ? (isNaN(Number(id)) ? 0 : Number(id)) : 0
  console.log("Parsed loan ID:", loanId)
  
  const { data: loanData, isLoading: loanLoading, error: loanError, refetch: refetchLoan } = useLoan(loanId)
  const { data: payments, isLoading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = usePaymentsByLoan(loanId, true)
  
  // Add the recalculate mutation
  const recalculatePaymentsMutation = useRecalculatePayments()
  // Add status update mutation
  const updateLoanStatusMutation = useUpdateLoanStatus()

  // State for confirmation dialogs
  const [isRecalculateConfirmOpen, setIsRecalculateConfirmOpen] = useState(false);
  const [isRenewConfirmOpen, setIsRenewConfirmOpen] = useState(false);
  const [isUpdateStatusConfirmOpen, setIsUpdateStatusConfirmOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);

  const loan = loanData;

  // Use useCallback for refreshAllData
  const refreshAllData = useCallback(async () => {
    console.log("Refreshing loan and payment data triggered by refreshAllData callback...");
    try {
      await refetchLoan();
      await refetchPayments();
    } catch (err) {
      console.error("Error during refreshAllData:", err);
      // Optionally, show a toast or handle error
    }
  }, [refetchLoan, refetchPayments]); // Dependencies for useCallback
  
  // Mutation for renewing the loan (should be preserved)
  const renewLoanMutation = useMutation(
    async (loanIdToRenew: number): Promise<ExtendedLoan> => { 
      const response = await api.post(`/loans/${loanIdToRenew}/renew`);
      return response.data as ExtendedLoan; 
    },
    {
      onSuccess: (newlyCreatedLoan: ExtendedLoan) => { 
        console.log("Renew loan onSuccess triggered. Data:", newlyCreatedLoan);
        toast({
          title: "Loan Renewed Successfully",
          description: `Old loan #${loanId} marked completed. New loan #${newlyCreatedLoan.id} created.`,
          variant: "default",
        });
        
        console.log("Attempting to navigate to /loans");
        navigate("/loans");
      },
      onError: (error: any) => {
        console.error("Renew loan onError triggered:", error);
        console.error("Error renewing loan:", error);
        toast({
          title: "Renewal Failed",
          description: error.response?.data?.detail || "Failed to renew the loan. Please ensure the backend supports this feature.",
          variant: "destructive",
        });
      },
    }
  );
  
  // Log the error if there is one
  useEffect(() => {
    if (loanError) {
      console.error("Error fetching loan:", loanError)
    }
  }, [loanError])

  // Add effect to refresh data when returning from payment page or on regular intervals
  useEffect(() => {
    // Initial fetch when component mounts (or refreshAllData reference changes)
    refreshAllData();
    
    // Also set up a refresh interval (e.g., every 30 seconds) to catch updates made elsewhere
    const refreshInterval = setInterval(() => {
      console.log("Refreshing loan and payment data due to interval...");
      refreshAllData();
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [refreshAllData]); // Now, this effect only re-runs if refreshAllData's reference changes.
  
  const [paymentSchedule, setPaymentSchedule] = useState<Payment[]>([])
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [totalDue, setTotalDue] = useState(0)
  const [borrowerName, setBorrowerName] = useState<string>("")

  // Combined loading and error state
  const isLoading = loanLoading || paymentsLoading;
  const error = loanError || paymentsError;

  // Fetch borrower name (keep this useEffect, maybe simplify)
  useEffect(() => {
    let isMounted = true;
    const fetchBorrowerData = async () => {
      if (!loan || !loan.borrower_id) return;
      
      // Check if we already have this borrower in our cache
      if (borrowerCache.has(loan.borrower_id)) {
        setBorrowerName(borrowerCache.get(loan.borrower_id) || "");
        return;
      }
      
      try {
        console.log(`Fetching borrower with ID: ${loan.borrower_id}`);
        const response = await api.get(`/borrowers/${loan.borrower_id}`);
        console.log("Borrower API response:", response.data);
        
        // Make sure we're accessing the right property and component is still mounted
        if (response.data && response.data.name && isMounted) {
          // Store in cache for future use
          borrowerCache.set(loan.borrower_id, response.data.name);
          setBorrowerName(response.data.name);
        } else if (isMounted) {
          console.warn("Borrower response missing name property:", response.data);
          setBorrowerName(`Borrower #${loan.borrower_id}`);
        }
      } catch (err) {
        console.error("Error fetching borrower:", err);
        if (isMounted) setBorrowerName(`Borrower #${loan.borrower_id}`);
      }
    };
    if (loan) fetchBorrowerData();
    return () => { isMounted = false; };
  }, [loan]); // Only depends on loan

  // Process fetched payment data and update loan status if needed
  useEffect(() => {
    if (payments && loan && !isLoading) {
      // Use the fetched payments directly
      setPaymentSchedule(payments);

      // Calculate total amount due (principal + interest)
      let totalAmount = 0;
      payments.forEach(p => { totalAmount += p.amount_due; });
      setTotalDue(totalAmount);

      // Calculate total paid
      let totalPaidAmount = 0;
      payments.forEach(p => { totalPaidAmount += p.amount_paid || 0; });
      setTotalPaid(totalPaidAmount);

      // Calculate progress based on total amount due
      const progress = totalAmount > 0 
        ? Math.min(100, Math.round((totalPaidAmount / totalAmount) * 100))
        : 0;
      setPaymentProgress(progress);

      // Check if all payments are complete
      const allPaymentsComplete = payments.every(p => p.paid_at !== null && p.amount_paid >= p.amount_due);
      
      let newStatusToSet: string | null = null;

      if (allPaymentsComplete && loan.status !== "completed") {
        newStatusToSet = "completed";
      } else if (!allPaymentsComplete && loan.status === "completed") {
        newStatusToSet = "active";
      }
      
      // Only update status in the database if it needs to change and no mutation is currently loading
      if (newStatusToSet && !updateLoanStatusMutation.isLoading) {
        console.log(`Loan ${loan.id}: Current status is '${loan.status}', payments imply '${newStatusToSet}'. Attempting to update.`);
        updateLoanStatusMutation.mutate(
          { loanId: loan.id, status: newStatusToSet }, 
          {
            onSuccess: () => {
              toast({
                title: "Status Updated",
                description: `Loan status updated to ${newStatusToSet}.`,
                variant: "default"
              });
              refetchLoan(); // Refresh loan data with updated status
            },
            onError: (error) => {
              console.error("Error updating loan status:", error);
              toast({
                title: "Error",
                description: "Failed to update loan status.",
                variant: "destructive"
              });
            }
          }
        );
      }
    }
  }, [payments, loan, isLoading, updateLoanStatusMutation, toast, refetchLoan]);

  const confirmRecalculatePayments = () => {
    if (!loan) return;
    recalculatePaymentsMutation.mutate(loan.id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Payment schedule recalculated successfully!",
          variant: "default"
        });
        refetchPayments(); 
      },
      onError: (error) => {
        console.error("Error recalculating payments:", error);
        toast({
          title: "Error",
          description: "Failed to recalculate payment schedule. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const confirmRenewLoan = () => {
    if (!loan) return;
    renewLoanMutation.mutate(loan.id);
  };

  const confirmUpdateStatus = () => {
    if (!loan || !statusToUpdate || loan.status === statusToUpdate) return;
    
    updateLoanStatusMutation.mutate({ loanId: loan.id, status: statusToUpdate }, {
      onSuccess: () => {
        toast({
          title: "Status Updated",
          description: `Loan status updated to ${statusToUpdate}.`,
          variant: "default"
        });
        refetchLoan(); 
      },
      onError: (error) => {
        console.error("Error updating loan status:", error);
        toast({
          title: "Error",
          description: "Failed to update loan status.",
          variant: "destructive"
        });
      },
      onSettled: () => {
        setStatusToUpdate(null); // Reset status to update
      }
    });
  };

  if (isLoading) {
    return <LoanDetailPageSkeleton />
  }

  if (error || !loan) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold">
          {error ? "Error Loading Loan" : "Loan Not Found"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {error ? error.message : "The loan you're looking for doesn't exist."}
        </p>
        <Button onClick={() => navigate("/loans")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Loans
        </Button>
      </div>
    )
  }

  // Example: Next Payment Card
  const firstUnpaidOrPartial = paymentSchedule.find(p => !p.paid_at || (p.amount_paid < p.amount_due));
  const nextPaymentDisplayAmount = firstUnpaidOrPartial ? firstUnpaidOrPartial.amount_due : 0;
  const nextPaymentDisplayDate = firstUnpaidOrPartial ? firstUnpaidOrPartial.due_date : "N/A";

  // Define status badge color based on loan status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-emerald-500";
      case "completed": return "bg-blue-500";
      case "defaulted": return "bg-red-500";
      case "cancelled": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const isLoanCompleted = loan.status === "completed";
  const isLoanCancelled = loan.status === "cancelled"; // Added for renew button logic

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header title="Loan Details" />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Button onClick={() => navigate("/loans")} variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Loans
            </Button>
            <div className="flex gap-2">
              {/* Recalculate Button with Confirmation */}
              <AlertDialog open={isRecalculateConfirmOpen} onOpenChange={setIsRecalculateConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={recalculatePaymentsMutation.isLoading || isLoanCompleted || isLoanCancelled}
                  >
                    Recalculate Payments
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will recalculate the payment schedule for this loan. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmRecalculatePayments}>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button 
                onClick={() => navigate(`/loans/${loanId}/repay`)} 
                variant="default" 
                size="sm"
                disabled={isLoanCompleted || isLoanCancelled}
              >
                Record Payment
              </Button>
            </div>
          </div>

          {/* Top cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Loan Amount */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg">Loan Amount</h3>
                <p className="text-sm text-muted-foreground">Total loan value</p>
                <div className="flex items-center mt-2">
                  <DollarSign className="h-6 w-6 text-primary mr-2" />
                  <span className="text-2xl font-bold">{formatCurrency(loan.principal)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Next Payment */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg">Next Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Due on {nextPaymentDisplayDate}
                </p>
                <div className="flex items-center mt-2">
                  <Calendar className="h-6 w-6 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(nextPaymentDisplayAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Loan Progress */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg">Loan Progress</h3>
                <p className="text-sm text-muted-foreground">{paymentProgress}% completed</p>
                <Progress value={paymentProgress} className="mt-2 h-2" />
                <div className="flex justify-between text-sm mt-2">
                  <span>Paid: {formatCurrency(totalPaid)}</span>
                  <span>Remaining: {formatCurrency(totalDue - totalPaid)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loan Information */}
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Loan Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Borrower</p>
                      <p className="font-medium">
                        {borrowerName || `Borrower #${loan.borrower_id}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{loan.start_date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Term</p>
                      <p className="font-medium">{loan.term_units} {loan.term_frequency.toLowerCase()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{loan.interest_rate_percent}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="mt-1 flex items-center">
                        <div className={`rounded-full h-2 w-2 mr-2 ${getStatusColor(loan.status)}`}></div>
                        <span>{capitalizeFirstLetter(loan.status)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Cycle</p>
                      <p className="font-medium">{capitalizeFirstLetter(loan.interest_cycle || "yearly")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/loans/${loan.id}/repay`)}
                    disabled={isLoanCompleted || isLoanCancelled}
                  >
                    Record Payment
                  </Button>
                  
                  {/* Recalculate Payments with Confirmation */}
                  <AlertDialog open={isRecalculateConfirmOpen} onOpenChange={setIsRecalculateConfirmOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={recalculatePaymentsMutation.isLoading || isLoanCompleted || isLoanCancelled}
                      >
                        <RotateCw className="mr-2 h-4 w-4" />
                        {recalculatePaymentsMutation.isLoading ? "Recalculating..." : "Recalculate Payments"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Recalculation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to recalculate the payment schedule for this loan? This may alter existing payment amounts and due dates.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRecalculatePayments}>Confirm</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Renew Loan with Confirmation */}
                  <AlertDialog open={isRenewConfirmOpen} onOpenChange={setIsRenewConfirmOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!loan || isLoanCompleted || isLoanCancelled || renewLoanMutation.isLoading}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {renewLoanMutation.isLoading ? "Renewing Loan..." : "Renew Loan"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Loan Renewal</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark the current loan as completed (all outstanding payments will be marked as paid) and create a new loan with the same terms, starting today. Are you sure?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRenewLoan}>Confirm Renewal</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {/* Status Update Dialog (common for multiple status buttons) */}
                  <AlertDialog open={isUpdateStatusConfirmOpen} onOpenChange={setIsUpdateStatusConfirmOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                          {`Are you sure you want to change the loan status to "${statusToUpdate}"?`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setStatusToUpdate(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmUpdateStatus}>Confirm</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <div className="flex space-x-2">
                    {loan.status !== "active" && !isLoanCompleted && !isLoanCancelled && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => { setStatusToUpdate("active"); setIsUpdateStatusConfirmOpen(true); }}
                      >
                        Set Active
                      </Button>
                    )}
                    {loan.status !== "completed" && !isLoanCancelled && ( // Allow marking active/defaulted as complete
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => { setStatusToUpdate("completed"); setIsUpdateStatusConfirmOpen(true); }}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule and Activity */}
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <div className="flex space-x-2 mb-6">
                  <Button 
                    variant={activeTab === "payment" ? "default" : "outline"}
                    onClick={() => setActiveTab("payment")}
                    className="flex-1"
                  >
                    Payment Schedule
                  </Button>
                  <Button 
                    variant={activeTab === "activity" ? "default" : "outline"}
                    onClick={() => setActiveTab("activity")}
                    className="flex-1"
                  >
                    Loan Activity
                  </Button>
                </div>

                {activeTab === "payment" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Payment Schedule</h3>
                    <p className="text-sm text-muted-foreground mb-6">Upcoming and past payments</p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">DUE DATE</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">AMOUNT</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">STATUS</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">PAID DATE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentSchedule.map((payment) => (
                            <tr key={payment.id} className="border-b border-border">
                              <td className="py-4 px-4">{payment.due_date}</td>
                              <td className="py-4 px-4 font-medium">{formatCurrency(payment.amount_due)}</td>
                              <td className="py-4 px-4">
                                <PaymentStatus payment={payment} />
                              </td>
                              <td className="py-4 px-4">{payment.paid_at ? payment.paid_at.split('T')[0] : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Loan Activity</h3>
                    <p className="text-sm text-muted-foreground mb-6">History of loan events</p>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Loan created</p>
                          <p className="text-sm text-muted-foreground mt-1">{loan.start_date}</p>
                        </div>
                        <Badge variant="outline">Created</Badge>
                      </div>
                      
                      {paymentSchedule
                        .filter(payment => payment.paid_at)
                        .sort((a, b) => new Date(b.paid_at || '').getTime() - new Date(a.paid_at || '').getTime())
                        .map(payment => (
                          <div key={payment.id} className="flex justify-between p-4 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">Payment received</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {payment.paid_at ? payment.paid_at.split('T')[0] : ""}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              {formatCurrency(payment.amount_paid)}
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 