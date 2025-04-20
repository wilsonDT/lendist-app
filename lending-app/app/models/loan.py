from sqlmodel import SQLModel, Field, Relationship
from datetime import date, datetime
from typing import List, TYPE_CHECKING
from .borrower import Borrower

if TYPE_CHECKING:
    from .payment import Payment

class Loan(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    borrower_id: int = Field(foreign_key="borrower.id")
    borrower: Borrower | None = Relationship(back_populates="loans")
    principal: float
    interest_rate_percent: float
    term_units: int            # e.g. 4
    term_frequency: str        # WEEKLY | MONTHLY
    repayment_type: str        # FLAT | AMORTISED
    start_date: date
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    payments: List["Payment"] = Relationship(back_populates="loan") 