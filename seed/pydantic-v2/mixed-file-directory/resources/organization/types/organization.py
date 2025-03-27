from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.user.types.user import User

from pydantic import BaseModel


class Organization(BaseModel):
    id: str
    name: str
    users: List[User]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
