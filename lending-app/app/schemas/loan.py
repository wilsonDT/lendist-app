from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List
from .borrower import BorrowerResponse

class LoanBase(BaseModel):
    borrower_id: int
    principal: float
    interest_rate_percent: float
    term_units: int
    term_frequency: str  # WEEKLY | MONTHLY
    repayment_type: str  # FLAT | AMORTISED
    start_date: date

class LoanCreate(LoanBase):
    pass

class LoanUpdate(BaseModel):
    principal: Optional[float] = None
    interest_rate_percent: Optional[float] = None
    term_units: Optional[int] = None
    term_frequency: Optional[str] = None
    repayment_type: Optional[str] = None
    start_date: Optional[date] = None

class LoanResponse(LoanBase):
    id: int
    created_at: datetime
    borrower: Optional[BorrowerResponse] = None
    
    class Config:
        orm_mode = True 