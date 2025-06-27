from pydantic import BaseModel
from typing import Optional
from .metadata_union import MetadataUnion
from dt import datetime
from core.datetime_utils import serialize_datetime

class Request(BaseModel):
    union: Optional[MetadataUnion] = None
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

