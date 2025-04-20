import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card } from "../components/ui/card";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { BorrowerDialog } from "../components/borrower-dialog";

const borrowers = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    mobile: "09171234567",
    activeLoans: 4,
    totalAmount: "₱200,000",
  },
  {
    id: 2,
    name: "John Smith",
    mobile: "09179876543",
    activeLoans: 2,
    totalAmount: "₱60,000",
  },
];

export default function BorrowersPage() {
  const [selectedBorrower, setSelectedBorrower] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewBorrower = (borrower: any) => {
    setSelectedBorrower(borrower);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header title="Borrowers" />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">Manage your borrowers and their information</p>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New Borrower
            </Button>
          </div>

          <Card className="border-border/40">
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
                {borrowers.map((borrower) => (
                  <TableRow key={borrower.id} className="hover:bg-secondary/50">
                    <TableCell className="font-medium">{borrower.name}</TableCell>
                    <TableCell>{borrower.mobile}</TableCell>
                    <TableCell>{borrower.activeLoans}</TableCell>
                    <TableCell>{borrower.totalAmount}</TableCell>
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
          </Card>

          {selectedBorrower && (
            <BorrowerDialog 
              borrower={selectedBorrower} 
              isOpen={isDialogOpen} 
              onClose={handleCloseDialog} 
            />
          )}
        </main>
      </div>
    </div>
  );
} 