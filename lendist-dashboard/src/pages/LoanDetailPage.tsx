import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Sidebar } from "../components/sidebar"
import { Header } from "../components/header"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Progress } from "../components/ui/progress"
import { ArrowLeft, Calendar, CreditCard, DollarSign, User, Clock, FileText, CheckCircle2, PlusCircle } from "lucide-react"
import { LoanDetailPageSkeleton } from "../components/skeleton-layout"

// Mock loans data - in a real app this would come from an API
const mockLoans = [
  {
    id: "1",
    borrower: "Juan Dela Cruz",
    borrowerId: 1,
    amount: "₱50,000",
    date: "2025-05-01",
    status: "active",
    term: "4 monthly",
    nextPayment: "2025-06-01",
    amountDue: "₱12,500",
    totalPaid: "₱12,500",
    remainingAmount: "₱37,500",
    progress: 25,
    interestRate: "5%",
    purpose: "Business",
    collateral: "None",
  },
  {
    id: "2",
    borrower: "Juan Dela Cruz",
    borrowerId: 1,
    amount: "₱50,000",
    date: "2025-05-01",
    status: "active",
    term: "4 monthly",
    nextPayment: "2025-06-01",
    amountDue: "₱12,500",
    totalPaid: "₱12,500",
    remainingAmount: "₱37,500",
    progress: 25,
    interestRate: "5%",
    purpose: "Business",
    collateral: "None",
  },
  {
    id: "3",
    borrower: "Juan Dela Cruz",
    borrowerId: 1,
    amount: "₱50,000",
    date: "2025-05-01",
    status: "active",
    term: "4 monthly",
    nextPayment: "2025-06-01",
    amountDue: "₱12,500",
    totalPaid: "₱12,500",
    remainingAmount: "₱37,500",
    progress: 25,
    interestRate: "5%",
    purpose: "Business",
    collateral: "None",
  },
  {
    id: "4",
    borrower: "Juan Dela Cruz",
    borrowerId: 1,
    amount: "₱50,000",
    date: "2025-05-01",
    status: "active",
    term: "4 monthly",
    nextPayment: "2025-06-01",
    amountDue: "₱12,500",
    totalPaid: "₱12,500",
    remainingAmount: "₱37,500",
    progress: 25,
    interestRate: "5%",
    purpose: "Business",
    collateral: "None",
  },
  {
    id: "5",
    borrower: "John Smith",
    borrowerId: 2,
    amount: "₱50,000",
    date: "2025-05-01",
    status: "active",
    term: "4 monthly",
    nextPayment: "2025-06-01",
    amountDue: "₱12,500",
    totalPaid: "₱12,500",
    remainingAmount: "₱37,500",
    progress: 25,
    interestRate: "5%",
    purpose: "Business",
    collateral: "None",
  },
  {
    id: "6",
    borrower: "John Smith",
    borrowerId: 2,
    amount: "₱10,000",
    date: "2025-04-20",
    status: "active",
    term: "4 monthly",
    nextPayment: "2025-05-20",
    amountDue: "₱2,500",
    totalPaid: "₱0",
    remainingAmount: "₱10,000",
    progress: 0,
    interestRate: "5%",
    purpose: "Personal",
    collateral: "None",
  },
];

export default function LoanDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState("schedule")
  const [loan, setLoan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentSchedule, setPaymentSchedule] = useState<any[]>([])
  const [loanActivity, setLoanActivity] = useState<any[]>([])

  useEffect(() => {
    // Simulate API fetch with a small delay
    const timer = setTimeout(() => {
      const foundLoan = mockLoans.find(loan => loan.id === id)
      setLoan(foundLoan || null)
      setIsLoading(false)
      if (foundLoan) {
        setPaymentSchedule(generatePaymentSchedule(foundLoan))
        setLoanActivity(generateLoanActivity(foundLoan))
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [id])

  // Mock payment schedule based on the loan
  const generatePaymentSchedule = (loan: any) => {
    if (!loan) return []
    
    // Extract the number of payments from the term (assuming format like "4 monthly")
    const numPayments = parseInt(loan.term.split(" ")[0])
    
    // Calculate payment amount (simplistic calculation)
    const paymentAmount = loan.amountDue
    
    // Extract loan start date
    const startDate = new Date(loan.date)
    
    const payments = []
    for (let i = 0; i < numPayments; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(startDate.getMonth() + i)
      
      const isCompleted = i === 0 && loan.progress > 0
      
      payments.push({
        id: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: paymentAmount,
        status: isCompleted ? "paid" : "upcoming",
        paidDate: isCompleted ? "2025-05-15" : null,
      })
    }
    
    return payments
  }

  // Mock loan activity based on payment schedule
  const generateLoanActivity = (loan: any) => {
    if (!loan) return []
    
    const activities = [
      {
        id: 1,
        date: loan.date,
        type: "creation",
        description: "Loan created",
        amount: loan.amount,
      }
    ]
    
    // Add payment activities for paid payments
    const paidPayments = paymentSchedule.filter(p => p.status === "paid")
    paidPayments.forEach((payment, index) => {
      activities.push({
        id: activities.length + 1,
        date: payment.paidDate,
        type: "payment",
        description: "Payment received",
        amount: payment.amount,
      })
    })
    
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  if (isLoading) {
    return <LoanDetailPageSkeleton />
  }

  if (!loan) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loan Not Found</h2>
          <p className="text-muted-foreground mb-4">The loan you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/loans")}>
            Back to Loans
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Loan Details" />
        <main className="p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/loans")}>
              <ArrowLeft className="h-4 w-4" />
              Back to Loans
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Loan Amount</CardTitle>
                <CardDescription>Total loan value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-2xl font-bold">{loan.amount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Next Payment</CardTitle>
                <CardDescription>Due on {loan.nextPayment}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                  <span className="text-2xl font-bold">{loan.amountDue}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Loan Progress</CardTitle>
                <CardDescription>{loan.progress}% completed</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={loan.progress} className="h-2 mt-2" />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>Paid: {loan.totalPaid}</span>
                  <span>Remaining: {loan.remainingAmount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle>Loan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Borrower</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 font-medium"
                      onClick={() => navigate(`/borrowers/${loan.borrowerId}`)}
                    >
                      {loan.borrower}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Start Date</span>
                    </div>
                    <span>{loan.date}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Term</span>
                    </div>
                    <span>{loan.term}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Interest Rate</span>
                    </div>
                    <span>{loan.interestRate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Purpose</span>
                    </div>
                    <span>{loan.purpose}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Status</span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      {loan.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex flex-col gap-2">
                <Button className="w-full">Record Payment</Button>
                <Button variant="outline" className="w-full">
                  Edit Loan
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <Tabs defaultValue="schedule" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
                  <TabsTrigger value="activity">Loan Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule">
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle>Payment Schedule</CardTitle>
                      <CardDescription>Upcoming and past payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Upcoming Payments</h3>
                        <Button variant="outline" size="sm">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Payment
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>DUE DATE</TableHead>
                            <TableHead>AMOUNT</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead>PAID DATE</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentSchedule.map((payment) => (
                            <TableRow key={payment.id} className="hover:bg-secondary/50">
                              <TableCell>{payment.dueDate}</TableCell>
                              <TableCell className="font-medium">{payment.amount}</TableCell>
                              <TableCell>
                                {payment.status === "paid" ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Paid
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  >
                                    Upcoming
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{payment.paidDate || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle>Loan Activity</CardTitle>
                      <CardDescription>History of loan events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-[2px] before:bg-border">
                        {loanActivity.map((activity) => (
                          <div key={activity.id} className="relative pb-6">
                            <div className="absolute left-[-22px] h-4 w-4 rounded-full bg-secondary border-2 border-primary" />
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{activity.description}</p>
                                <Badge
                                  variant="outline"
                                  className={
                                    activity.type === "payment"
                                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                      : "bg-sky-500/10 text-sky-500 border-sky-500/20"
                                  }
                                >
                                  {activity.amount}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{activity.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 