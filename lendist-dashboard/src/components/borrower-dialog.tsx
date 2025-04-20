"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Phone, Mail, MapPin, CreditCard, Calendar, ArrowUpRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface BorrowerDialogProps {
  borrower: any
  isOpen: boolean
  onClose: () => void
}

export function BorrowerDialog({ borrower, isOpen, onClose }: BorrowerDialogProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  if (!borrower) return null

  // Mock data for the borrower's loans
  const loans = [
    {
      id: 1,
      amount: "₱50,000",
      date: "2025-05-01",
      status: "active",
      term: "4 monthly",
      nextPayment: "2025-06-01",
      amountDue: "₱12,500",
    },
    {
      id: 2,
      amount: "₱50,000",
      date: "2025-05-01",
      status: "active",
      term: "4 monthly",
      nextPayment: "2025-06-01",
      amountDue: "₱12,500",
    },
  ]

  // Mock data for payment history
  const payments = [
    {
      id: 1,
      date: "2025-05-15",
      amount: "₱12,500",
      method: "Cash",
      status: "completed",
      loanId: 1,
    },
    {
      id: 2,
      date: "2025-04-15",
      amount: "₱12,500",
      method: "Bank Transfer",
      status: "completed",
      loanId: 2,
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

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
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{borrower.email || "email@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{borrower.address || "Manila, Philippines"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{borrower.activeLoans} Active Loans</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Client since Jan 2025</span>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Loan Amount</p>
                          <p className="text-2xl font-bold">{borrower.totalAmount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active Loans</p>
                          <p className="text-2xl font-bold">{borrower.activeLoans}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Next Payment</p>
                          <p className="text-2xl font-bold">₱12,500</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="text-2xl font-bold">Jun 1, 2025</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                          <div>
                            <p className="font-medium">Payment received</p>
                            <p className="text-sm text-muted-foreground">₱12,500 for Loan #1</p>
                            <p className="text-xs text-muted-foreground mt-1">May 15, 2025</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 h-2 w-2 rounded-full bg-sky-500" />
                          <div>
                            <p className="font-medium">New loan created</p>
                            <p className="text-sm text-muted-foreground">₱50,000 - 4 month term</p>
                            <p className="text-xs text-muted-foreground mt-1">May 1, 2025</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="loans" className="h-full">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Active Loans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>AMOUNT</TableHead>
                            <TableHead>DATE</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead>NEXT PAYMENT</TableHead>
                            <TableHead className="text-right">ACTIONS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loans.map((loan) => (
                            <TableRow key={loan.id} className="hover:bg-secondary/50">
                              <TableCell className="font-medium">{loan.amount}</TableCell>
                              <TableCell>{loan.date}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                >
                                  {loan.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{loan.nextPayment}</TableCell>
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="h-full">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>DATE</TableHead>
                            <TableHead>AMOUNT</TableHead>
                            <TableHead>METHOD</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead>LOAN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow key={payment.id} className="hover:bg-secondary/50">
                              <TableCell>{payment.date}</TableCell>
                              <TableCell className="font-medium">{payment.amount}</TableCell>
                              <TableCell>{payment.method}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                >
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-primary p-0"
                                  onClick={() => {
                                    onClose()
                                    navigate(`/loans/${payment.loanId}`)
                                  }}
                                >
                                  Loan #{payment.loanId}
                                  <ArrowUpRight className="ml-1 h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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