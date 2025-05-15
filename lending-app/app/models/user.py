from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: str # Supabase User ID (sub claim)
    email: Optional[str] = None
    # Add other fields from the token payload you might need, e.g., role
    # Be careful about what you trust from the token vs. what you fetch from your DB based on user_id 