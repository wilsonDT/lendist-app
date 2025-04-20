from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BorrowerBase(BaseModel):
    name: str
    mobile: Optional[str] = None

class BorrowerCreate(BorrowerBase):
    pass

class BorrowerUpdate(BorrowerBase):
    name: Optional[str] = None

class BorrowerResponse(BorrowerBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True 