from sqlmodel import SQLModel, Field, Relationship
from datetime import date, datetime
from typing import List
from .borrower import Borrower

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

Borrower.loans = Relationship(back_populates="borrower") 