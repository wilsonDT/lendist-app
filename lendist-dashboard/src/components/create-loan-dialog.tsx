import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { useNavigate } from "react-router-dom"
import { useCreateLoan } from "../hooks/useLoans"

// We're using these components type-unsafely due to TS issues, but they exist
// @ts-ignore
import { Label } from "./ui/label"
// @ts-ignore
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface CreateLoanDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateLoanDialog({ isOpen, onClose }: CreateLoanDialogProps) {
  const navigate = useNavigate()
  const createLoan = useCreateLoan()
  const [formData, setFormData] = useState({
    borrowerId: "",
    amount: "",
    interestRate: "",
    term: "",
    frequency: "monthly",
    repaymentType: "flat",
    startDate: "",
    purpose: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Map of borrower IDs to names for display in SelectValue
  const borrowerNames: Record<string, string> = {
    "1": "Juan Dela Cruz",
    "2": "John Smith"
  }

  // Map for frequency display names
  const frequencyNames: Record<string, string> = {
    "weekly": "Weekly",
    "monthly": "Monthly",
    "quarterly": "Quarterly"
  }

  // Map for repayment type display names
  const repaymentTypeNames: Record<string, string> = {
    "flat": "Flat",
    "amortized": "Amortized"
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        start_date: formData.startDate,
      }
      
      // Call the mutation to create the loan
      const response = await createLoan.mutateAsync(loanPayload)
      
      alert("Loan created successfully!")
      
      onClose()
      
      // Navigate to the new loan detail page with the actual ID from the response
      navigate(`/loans/${response.id}`)
    } catch (error) {
      console.error("Error creating loan:", error)
      alert("Failed to create loan. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
                    <SelectTrigger>
                      <SelectValue placeholder="Select borrower">
                        {formData.borrowerId ? borrowerNames[formData.borrowerId] : "Select borrower"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Juan Dela Cruz</SelectItem>
                      <SelectItem value="2">John Smith</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
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
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    name="purpose"
                    placeholder="Business, Personal, etc."
                    value={formData.purpose}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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