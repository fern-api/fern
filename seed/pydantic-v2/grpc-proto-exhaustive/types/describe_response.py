from typing import Dict, Optional

from .types.namespace_summary import NamespaceSummary
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class DescribeResponse(BaseModel):
    namespaces: Optional[Dict[str, NamespaceSummary]] = None
    dimension: Optional[int] = None
    fullness: Optional[float] = None
    total_count: Optional[int]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
