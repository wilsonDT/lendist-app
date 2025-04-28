from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Any
from .borrower import BorrowerResponse

class LoanBase(BaseModel):
    borrower_id: int
    principal: float
    interest_rate_percent: float
    term_units: int
    term_frequency: str  # DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    repayment_type: str  # FLAT, AMORTIZED
    interest_cycle: Optional[str] = "yearly"  # one-time, daily, weekly, monthly, yearly
    start_date: date
    status: str = "active"  # active, completed, defaulted, cancelled

class LoanCreate(LoanBase):
    pass

class LoanUpdate(BaseModel):
    borrower_id: Optional[int] = None
    principal: Optional[float] = None
    interest_rate_percent: Optional[float] = None
    term_units: Optional[int] = None
    term_frequency: Optional[str] = None
    repayment_type: Optional[str] = None
    interest_cycle: Optional[str] = None
    start_date: Optional[date] = None
    status: Optional[str] = None

class LoanResponse(LoanBase):
    id: int
    created_at: datetime
    borrower: Optional[BorrowerResponse] = None
    
    class Config:
        from_attributes = True
        exclude_unset = True
        exclude_none = True 