from pydantic import BaseModel
from typing import Optional
from .types.account import Account
from dt import datetime
from core.datetime_utils import serialize_datetime


class Memo(BaseModel):
    description: str
    account: Optional[Account] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
