from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
# Don't import LoanResponse to avoid circular imports
# from .loan import LoanResponse

class PaymentBase(BaseModel):
    loan_id: int
    due_date: date
    amount_due: float

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    amount_paid: float
    paid_at: datetime = datetime.utcnow()

class PaymentResponse(PaymentBase):
    id: int
    amount_paid: float
    paid_at: Optional[datetime] = None
    # Remove the loan relationship
    # loan: Optional[LoanResponse] = None
    
    class Config:
        from_attributes = True
        # Add exclude_unset and exclude_none to avoid relationship loading issues
        exclude_unset = True
        exclude_none = True 