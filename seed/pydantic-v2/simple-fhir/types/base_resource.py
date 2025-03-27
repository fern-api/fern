from typing import List

from .types.memo import Memo
from .types.resource_list import ResourceList
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class BaseResource(BaseModel):
    id: str
    related_resources: List[ResourceList]
    memo: Memo

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
