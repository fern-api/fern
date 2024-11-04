from pydantic import BaseModel


class SendResponse(BaseModel):
    message: str
    status: int
    success: bool
