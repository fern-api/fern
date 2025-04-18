from pydantic import BaseModel
from .types.username_page import UsernamePage
from dt import datetime
from core.datetime_utils import serialize_datetime


class UsernameCursor(BaseModel):
    cursor: UsernamePage

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
