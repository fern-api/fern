from pydantic import BaseModel
from typing import Optional


class TokenResponse(BaseModel):
    access_token: str
    expires_in: int
    refresh_token: Optional[str] = None
