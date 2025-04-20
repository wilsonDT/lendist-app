from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import List, TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from .loan import Loan

class Borrower(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    mobile: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow) 
    
    loans: List["Loan"] = Relationship(back_populates="borrower") 