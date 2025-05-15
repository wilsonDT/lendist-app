from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BorrowerBase(BaseModel):
    name: str
    mobile: str

class BorrowerCreate(BorrowerBase):
    pass

class BorrowerUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None

class BorrowerResponse(BaseModel):
    id: int
    user_id: str
    name: str
    mobile: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True 