from pydantic import BaseModel
from typing import List
from resources.user.types.user import User
from dt import datetime
from core.datetime_utils import serialize_datetime


class Organization(BaseModel):
    id: str
    name: str
    users: List[User]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
