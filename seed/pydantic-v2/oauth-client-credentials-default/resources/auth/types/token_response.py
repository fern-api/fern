from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime

"""An OAuth token response."""


class TokenResponse(BaseModel):
    access_token: str
    expires_in: int

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
