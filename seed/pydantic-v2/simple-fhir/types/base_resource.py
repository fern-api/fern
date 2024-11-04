from pydantic import BaseModel
from typing import List
from .types.resource_list import ResourceList
from .types.memo import Memo
from dt import datetime
from core.datetime_utils import serialize_datetime


class BaseResource(BaseModel):
    id: str
    related_resources: List[ResourceList]
    memo: Memo

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
