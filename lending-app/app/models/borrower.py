from sqlmodel import SQLModel, Field
from datetime import datetime

class Borrower(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    mobile: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow) 