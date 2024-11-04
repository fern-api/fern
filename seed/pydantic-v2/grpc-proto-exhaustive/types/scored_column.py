from pydantic import BaseModel
from typing import Optional, List
from .types.metadata import Metadata
from .types.indexed_data import IndexedData
from dt import datetime
from core.datetime_utils import serialize_datetime


class ScoredColumn(BaseModel):
    id: str
    score: Optional[float] = None
    values: Optional[List[float]] = None
    metadata: Optional[Metadata] = None
    indexed_data: Optional[IndexedData]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
