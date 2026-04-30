from pydantic import BaseModel
from types.root_type import RootType
from dt import datetime
from core.datetime_utils import serialize_datetime
class A(BaseModel, RootType):
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

