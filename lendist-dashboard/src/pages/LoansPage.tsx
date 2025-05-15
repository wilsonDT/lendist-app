import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card } from "../components/ui/card";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateLoanDialog } from "../components/create-loan-dialog";
import { useLoans, Loan } from "../hooks/useLoans";
import { useBorrowers, Borrower } from "../hooks/useBorrowers";
import { formatCurrency } from "../lib/utils.ts";

export default function LoansPage() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: loans, isLoading: loansLoading, error: loansError } = useLoans();
  const { data: borrowers, isLoading: borrowersLoading } = useBorrowers();
  
  const isLoading = loansLoading || borrowersLoading;
  const error = loansError;

  const handleViewLoanDetails = (loanId: number) => {
    navigate(`/loans/${loanId}`);
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  // Function to get borrower name from borrower ID
  const getBorrowerName = (borrowerId: number) => {
    if (!borrowers) return `Borrower #${borrowerId}`;
    const borrower = borrowers.find((b: Borrower) => b.id === borrowerId);
    return borrower ? borrower.name : `Borrower #${borrowerId}`;
  };

  // Function to get status display
  const getLoanStatus = (loan: Loan) => {
    // Capitalize first letter of status
    const status = loan.status || "active";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Function to format term
  const formatTerm = (loan: Loan) => {
    return `${loan.term_units} ${loan.term_frequency.toLowerCase()}`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Loans" />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">Manage your loans and payment schedules</p>
            <Button className="gap-2" onClick={openCreateDialog}>
              <PlusCircle className="h-4 w-4" />
              Create New Loan
            </Button>
          </div>

          <Card className="border-border/40">
            {isLoading ? (
              <div className="p-8 text-center">Loading loans...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error loading loans</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>BORROWER</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>TERM</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans && loans.length > 0 ? (
                    loans.map((loan) => (
                      <TableRow key={loan.id} className="hover:bg-secondary/50">
                        <TableCell className="font-medium">
                          {getBorrowerName(loan.borrower_id)}
                        </TableCell>
                        <TableCell>{formatCurrency(loan.principal)}</TableCell>
                        <TableCell>{new Date(loan.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            loan.status === 'active' 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : loan.status === 'completed'
                                ? "bg-gray-100 text-gray-500"
                                : loan.status === 'defaulted'
                                  ? "bg-red-100 text-red-500"
                                  : "bg-yellow-100 text-yellow-500"
                          }`}>
                            {getLoanStatus(loan)}
                          </span>
                        </TableCell>
                        <TableCell>{formatTerm(loan)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-primary"
                            onClick={() => handleViewLoanDetails(loan.id)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No loans found. Create your first loan to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>

          <CreateLoanDialog 
            isOpen={isCreateDialogOpen} 
            onClose={closeCreateDialog} 
          />
        </main>
      </div>
    </div>
  );
} 