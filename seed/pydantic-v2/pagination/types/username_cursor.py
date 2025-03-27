from .types.username_page import UsernamePage
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class UsernameCursor(BaseModel):
    cursor: UsernamePage

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
