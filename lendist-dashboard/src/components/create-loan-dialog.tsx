import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { useNavigate } from "react-router-dom"
import { useCreateLoan } from "../hooks/useLoans"
import { useBorrowers, Borrower } from "../hooks/useBorrowers"
import { DatePicker } from "./ui/date-picker"
import { parse, format } from "date-fns"
import { RepaymentSchedulePreview } from "./RepaymentSchedulePreview"
import axios from "axios"

// We're using these components type-unsafely due to TS issues, but they exist
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface CreateLoanDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateLoanDialog({ isOpen, onClose }: CreateLoanDialogProps) {
  const navigate = useNavigate()
  const createLoan = useCreateLoan()
  const { data: borrowers, isLoading: borrowersLoading, error } = useBorrowers()
  // Cast error to Error | null
  const borrowersError = error as Error | null;

  const [formData, setFormData] = useState({
    borrowerId: "",
    amount: "",
    interestRate: "",
    term: "",
    frequency: "monthly",
    repaymentType: "flat",
    startDate: "",
    interestCycle: "monthly",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Map for frequency display names
  const frequencyNames: Record<string, string> = {
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly",
    "quarterly": "Quarterly",
    "yearly": "Yearly"
  }

  // Map for repayment type display names
  const repaymentTypeNames: Record<string, string> = {
    "flat": "Flat",
    "amortized": "Amortized"
  }

  // Map for interest cycle display names
  const interestCycleNames: Record<string, string> = {
    "one-time": "One-time",
    "daily": "Per Day",
    "weekly": "Per Week",
    "monthly": "Per Month",
    "yearly": "Per Year"
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ 
      ...prev, 
      startDate: date ? format(date, "yyyy-MM-dd") : "" 
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.borrowerId || !formData.amount || !formData.interestRate || 
        !formData.term || !formData.startDate) {
      alert("Please fill out all required fields")
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Transform form data to match API payload structure
      const loanPayload = {
        borrower_id: parseInt(formData.borrowerId, 10),
        principal: parseFloat(formData.amount),
        interest_rate_percent: parseFloat(formData.interestRate),
        term_units: parseInt(formData.term, 10),
        term_frequency: formData.frequency,
        repayment_type: formData.repaymentType,
        interest_cycle: formData.interestCycle,
        start_date: formData.startDate,
        status: "active",
      }
      
      console.log('Submitting loan payload:', loanPayload);
      
      let createdLoanId = null;
      
      // Try direct API call as a workaround
      try {
        // Get the base URL from the api module
        const apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
        const response = await axios.post(`${apiBaseUrl}/loans/`, loanPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Direct API response:', response.data);
        
        if (response.data && response.data.id) {
          createdLoanId = response.data.id;
          console.log('Created loan ID from direct API:', createdLoanId);
        }
      } catch (directApiError) {
        console.error("Direct API error:", directApiError);
        // Fall back to useCreateLoan if direct API fails
      }
      
      // If direct API call didn't work, use the mutation
      if (!createdLoanId) {
        try {
          const response = await createLoan.mutateAsync(loanPayload);
          console.log('useCreateLoan response:', response);
          
          if (response && response.id) {
            createdLoanId = response.id;
            console.log('Created loan ID from useCreateLoan:', createdLoanId);
          }
        } catch (mutationError) {
          console.error("Mutation error:", mutationError);
          throw mutationError; // Re-throw to be caught by the outer catch
        }
      }
      
      // Ensure we have a valid loan ID before redirecting
      if (!createdLoanId) {
        throw new Error("Failed to get created loan ID");
      }
      
      alert("Loan created successfully!")
      onClose()
      
      // Navigate to the new loan detail page with the actual ID
      console.log(`Navigating to /loans/${createdLoanId}`);
      navigate(`/loans/${createdLoanId}`);
      
    } catch (error: unknown) {
      console.error("Error creating loan:", error)
      
      let errorMessage = "Failed to create loan. An unknown error occurred.";

      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data && typeof error.response.data === 'object') {
          const responseData = error.response.data as { detail?: string; [key: string]: unknown };
          errorMessage = `Failed to create loan: ${responseData.detail || JSON.stringify(responseData)}`;
        } else if (error.message) {
          errorMessage = `Failed to create loan: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = `Failed to create loan. Please check browser console for details and contact your backend team.\n\nError: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get borrower name from the fetched list
  const getSelectedBorrowerName = () => {
    if (!borrowers || !formData.borrowerId) return "Select borrower";
    const selectedBorrower = borrowers.find((b: Borrower) => b.id.toString() === formData.borrowerId);
    return selectedBorrower ? selectedBorrower.name : "Select borrower";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto p-8">
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borrowerId">Borrower</Label>
                  <Select
                    name="borrowerId"
                    value={formData.borrowerId}
                    onValueChange={(value: string) => handleSelectChange("borrowerId", value)}
                  >
                    <SelectTrigger disabled={borrowersLoading || !!borrowersError}>
                      <SelectValue placeholder={borrowersLoading ? "Loading..." : (borrowersError ? "Error loading" : "Select borrower")}>
                        {borrowersLoading ? "Loading..." : (borrowersError ? "Error loading borrowers" : getSelectedBorrowerName())}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {borrowers && borrowers.map((borrower: Borrower) => (
                        <SelectItem key={borrower.id} value={borrower.id.toString()}>
                          {borrower.name}
                        </SelectItem>
                      ))}
                      {borrowersLoading && <div className="p-2 text-sm text-muted-foreground">Loading...</div>}
                      {(!borrowers || borrowers.length === 0) && !borrowersLoading && !borrowersError && 
                        <div className="p-2 text-sm text-muted-foreground">No borrowers found</div>
                      }
                    </SelectContent>
                  </Select>
                  {/* Error message displayed below the Select component */}
                  {borrowersError && (
                    <p className="text-sm text-red-500 mt-1">
                      Could not load borrowers{borrowersError instanceof Error ? `: ${borrowersError.message}` : ''}.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    placeholder="₱0.00"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    name="interestRate"
                    placeholder="0.00%"
                    value={formData.interestRate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestCycle">Interest Cycle</Label>
                  <Select
                    name="interestCycle"
                    value={formData.interestCycle}
                    onValueChange={(value: string) => handleSelectChange("interestCycle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interest cycle">
                        {formData.interestCycle ? interestCycleNames[formData.interestCycle] : "Select interest cycle"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="daily">Per Day</SelectItem>
                      <SelectItem value="weekly">Per Week</SelectItem>
                      <SelectItem value="monthly">Per Month</SelectItem>
                      <SelectItem value="yearly">Per Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term">Term</Label>
                  <Input
                    id="term"
                    name="term"
                    placeholder="Number of payments"
                    value={formData.term}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    name="frequency"
                    value={formData.frequency}
                    onValueChange={(value: string) => handleSelectChange("frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency">
                        {formData.frequency ? frequencyNames[formData.frequency] : "Select frequency"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repaymentType">Repayment Type</Label>
                  <Select
                    name="repaymentType"
                    value={formData.repaymentType}
                    onValueChange={(value: string) => handleSelectChange("repaymentType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type">
                        {formData.repaymentType ? repaymentTypeNames[formData.repaymentType] : "Select type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="amortized">Amortized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker
                    name="startDate"
                    placeholder="Select start date"
                    value={formData.startDate ? parse(formData.startDate, "yyyy-MM-dd", new Date()) : undefined}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Repayment Schedule Preview */}
          <div className="mt-6">
            <RepaymentSchedulePreview
              principal={parseFloat(formData.amount) || 0}
              interestRate={parseFloat(formData.interestRate) || 0}
              termUnits={parseInt(formData.term) || 0}
              frequency={formData.frequency}
              repaymentType={formData.repaymentType}
              interestCycle={formData.interestCycle}
              startDate={formData.startDate ? parse(formData.startDate, "yyyy-MM-dd", new Date()) : undefined}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Loan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 