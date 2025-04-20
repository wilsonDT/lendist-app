from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from .loan import LoanResponse

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
    loan: Optional[LoanResponse] = None
    
    class Config:
        orm_mode = True 