from pydantic import BaseModel
from resources.user.types.user import User
from dt import datetime
from core.datetime_utils import serialize_datetime


class NestedUser(BaseModel):
    name: str
    user: User

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
