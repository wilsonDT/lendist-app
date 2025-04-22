import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useCreateBorrower } from "../hooks/useBorrowers"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

interface CreateBorrowerDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateBorrowerDialog({ isOpen, onClose }: CreateBorrowerDialogProps) {
  const queryClient = useQueryClient()
  const createBorrower = useCreateBorrower()
  
  const [formData, setFormData] = useState({
    name: "",
    mobile: ""
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
    
    // Clear API error when any field changes
    if (apiError) {
      setApiError(null)
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required"
    } else if (!/^\d+$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number should contain only digits"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      // Send name and mobile fields to the API
      const apiPayload = {
        name: formData.name,
        mobile: formData.mobile
      }
      
      await createBorrower.mutateAsync(apiPayload, {
        onSuccess: () => {
          // Explicitly invalidate borrowers query to refetch the list
          queryClient.invalidateQueries(['borrowers'])
          
          // Reset form and close dialog
          setFormData({
            name: "",
            mobile: ""
          })
          setApiError(null)
          onClose()
        },
        onError: (error) => {
          console.error("Failed to create borrower:", error)
          setApiError("Failed to create borrower. Please try again.")
        }
      })
    } catch (error) {
      console.error("Failed to create borrower:", error)
      setApiError("An unexpected error occurred. Please try again.")
    }
  }
  
  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog is closed
      setFormData({
        name: "",
        mobile: ""
      })
      setErrors({})
      setApiError(null)
      onClose()
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-auto p-6">
        <DialogHeader>
          <DialogTitle>Add New Borrower</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {apiError}
            </div>
          )}
          
          <Card className="border-0 shadow-none">
            <CardContent className="p-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  placeholder="e.g. 09171234567"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={errors.mobile ? "border-red-500" : ""}
                />
                {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose} 
              disabled={createBorrower.isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createBorrower.isLoading}
            >
              {createBorrower.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Borrower"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 