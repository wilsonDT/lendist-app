"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Phone, CreditCard, Calendar, ArrowUpRight, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useBorrower, Borrower } from "../hooks/useBorrowers"
import { useLoansByBorrower } from "../hooks/useLoans"
import { usePaymentsByBorrower } from "../hooks/usePayments"
import { formatCurrency } from "../utils/format"
import { format } from "date-fns"

interface BorrowerDialogProps {
  borrower: Borrower
  isOpen: boolean
  onClose: () => void
}

export function BorrowerDialog({ borrower, isOpen, onClose }: BorrowerDialogProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Fetch detailed borrower data
  const { data: borrowerDetails, isLoading: borrowerLoading } = useBorrower(borrower.id);
  
  // Fetch borrower's loans
  const { data: loans, isLoading: loansLoading } = useLoansByBorrower(borrower.id);
  
  // Fetch borrower's payments
  const { data: payments, isLoading: paymentsLoading } = usePaymentsByBorrower(borrower.id);

  if (!borrower) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (_e) {
      return dateString;
    }
  };
  
  // Format client since date
  const clientSinceDate = borrowerDetails?.created_at 
    ? formatDate(borrowerDetails.created_at)
    : "Unknown";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Borrower Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 mt-4 p-8">
          <div className="md:w-1/3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(borrower.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-center text-xl">{borrower.name}</CardTitle>
                <CardDescription className="text-center">
                  <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20">
                    Active Borrower
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{borrower.mobile}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{borrowerDetails?.active_loans_count || 0} Active Loans</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Client since {clientSinceDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="loans">Loans</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              <div className="tabs-content-container min-h-[400px]">
                <TabsContent value="overview" className="space-y-4 h-full">
                  {borrowerLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                    </div>
                  ) : (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Loan Amount</p>
                              <p className="text-2xl font-bold">{formatCurrency(borrowerDetails?.total_principal || 0)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Active Loans</p>
                              <p className="text-2xl font-bold">{borrowerDetails?.active_loans_count || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Loans</p>
                              <p className="text-2xl font-bold">{borrowerDetails?.total_loans || 0}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Repayment Rate</p>
                              <p className="text-2xl font-bold">{borrowerDetails?.repayment_rate || 0}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {payments && payments.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {payments.slice(0, 2).map(payment => (
                                <div key={payment.id} className="flex items-start gap-4">
                                  <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                                  <div>
                                    <p className="font-medium">Payment received</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatCurrency(payment.amount_paid)} for Loan #{payment.loan_id}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatDate(payment.payment_date)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="loans" className="h-full">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Active Loans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loansLoading ? (
                        <div className="flex justify-center items-center h-60">
                          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                        </div>
                      ) : loans && loans.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead>AMOUNT</TableHead>
                              <TableHead>DATE</TableHead>
                              <TableHead>TYPE</TableHead>
                              <TableHead>TERM</TableHead>
                              <TableHead className="text-right">ACTIONS</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loans.map((loan) => (
                              <TableRow key={loan.id} className="hover:bg-secondary/50">
                                <TableCell className="font-medium">{formatCurrency(loan.principal)}</TableCell>
                                <TableCell>{formatDate(loan.start_date)}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  >
                                    {loan.repayment_type.toLowerCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>{loan.term_units} {loan.term_frequency.toLowerCase()}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-primary"
                                    onClick={() => {
                                      onClose()
                                      navigate(`/loans/${loan.id}`)
                                    }}
                                  >
                                    Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-10 text-muted-foreground">
                          No loans found for this borrower
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="h-full">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {paymentsLoading ? (
                        <div className="flex justify-center items-center h-60">
                          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                        </div>
                      ) : payments && payments.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead>DATE</TableHead>
                              <TableHead>AMOUNT</TableHead>
                              <TableHead>METHOD</TableHead>
                              <TableHead>LOAN</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.map((payment) => (
                              <TableRow key={payment.id} className="hover:bg-secondary/50">
                                <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(payment.amount_paid)}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  >
                                    {payment.payment_method.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-primary p-0"
                                    onClick={() => {
                                      onClose()
                                      navigate(`/loans/${payment.loan_id}`)
                                    }}
                                  >
                                    Loan #{payment.loan_id}
                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-10 text-muted-foreground">
                          No payment history found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 