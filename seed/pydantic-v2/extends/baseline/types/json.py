from pydantic import BaseModel
from .types.docs import Docs
from dt import datetime
from core.datetime_utils import serialize_datetime


class Json(BaseModel, Docs):
    raw: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
