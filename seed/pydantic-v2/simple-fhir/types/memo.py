from typing import Optional

from .types.account import Account
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Memo(BaseModel):
    description: str
    account: Optional[Account] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
