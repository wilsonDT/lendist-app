from pydantic import BaseModel

class ResponseModel(BaseModel):
    success: bool
    data: dict | None = None
    message: str | None = None 