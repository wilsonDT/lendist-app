from sqlmodel import SQLModel, Field, Relationship
from datetime import date, datetime
from .loan import Loan

class Payment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    loan_id: int = Field(foreign_key="loan.id")
    loan: Loan | None = Relationship(back_populates="payments")
    due_date: date
    amount_due: float
    amount_paid: float = 0.0
    paid_at: datetime | None = None 