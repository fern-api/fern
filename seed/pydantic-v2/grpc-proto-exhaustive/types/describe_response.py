from pydantic import BaseModel
from typing import Optional, Dict
from .types.namespace_summary import NamespaceSummary
from dt import datetime
from core.datetime_utils import serialize_datetime


class DescribeResponse(BaseModel):
    namespaces: Optional[Dict[str, NamespaceSummary]] = None
    dimension: Optional[int] = None
    fullness: Optional[float] = None
    total_count: Optional[int]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
