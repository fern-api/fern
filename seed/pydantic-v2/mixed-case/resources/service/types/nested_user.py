from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.service.types.user import User

from pydantic import BaseModel


class NestedUser(BaseModel):
    name: str
    nested_user: User

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
