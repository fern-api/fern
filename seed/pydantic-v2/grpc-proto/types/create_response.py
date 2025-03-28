from typing import Optional

from .types.user_model import UserModel
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class CreateResponse(BaseModel):
    user: Optional[UserModel] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
