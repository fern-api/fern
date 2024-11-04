from pydantic import BaseModel

"""An OAuth token response."""


class TokenResponse(BaseModel):
    access_token: str
    expires_in: int
