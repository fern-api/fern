from .types.docs import Docs
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class ExampleType(BaseModel, Docs):
    name: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
