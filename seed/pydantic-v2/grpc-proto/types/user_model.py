from pydantic import BaseModel
from typing import Optional
from .types.metadata import Metadata
from dt import datetime
from core.datetime_utils import serialize_datetime


class UserModel(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    metadata: Optional[Metadata] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
