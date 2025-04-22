import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card } from "../components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { BorrowerDialog } from "../components/borrower-dialog";
import { useBorrowers, Borrower } from "../hooks/useBorrowers";
import { formatCurrency } from "../utils/format";
import { CreateBorrowerDialog } from "../components/create-borrower-dialog";

export default function BorrowersPage() {
  const { data: borrowers, isLoading, isError } = useBorrowers();
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleViewBorrower = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Borrowers" />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">Manage your borrowers and their information</p>
            <Button className="gap-2" onClick={handleOpenCreateDialog}>
              <PlusCircle className="h-4 w-4" />
              Add New Borrower
            </Button>
          </div>

          <Card className="border-border/40">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-muted-foreground">
                Error loading borrowers. Please try again.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">NAME</TableHead>
                    <TableHead>MOBILE</TableHead>
                    <TableHead>ACTIVE LOANS</TableHead>
                    <TableHead>TOTAL AMOUNT</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowers && borrowers.map((borrower) => (
                    <TableRow key={borrower.id} className="hover:bg-secondary/50">
                      <TableCell className="font-medium">{borrower.name}</TableCell>
                      <TableCell>{borrower.mobile}</TableCell>
                      <TableCell>{borrower.active_loans_count || 0}</TableCell>
                      <TableCell>{formatCurrency(borrower.total_principal || 0)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-primary"
                          onClick={() => handleViewBorrower(borrower)}
                        >
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {selectedBorrower && (
            <BorrowerDialog 
              borrower={selectedBorrower} 
              isOpen={isDialogOpen} 
              onClose={handleCloseDialog} 
            />
          )}
          
          <CreateBorrowerDialog
            isOpen={isCreateDialogOpen}
            onClose={handleCloseCreateDialog}
          />
        </main>
      </div>
    </div>
  );
} 