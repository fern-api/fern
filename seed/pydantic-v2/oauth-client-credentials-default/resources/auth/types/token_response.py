from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class TokenResponse(BaseModel):
"""An OAuth token response."""
    access_token: str
    expires_in: int
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

