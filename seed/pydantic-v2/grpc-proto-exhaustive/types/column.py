from typing import List, Optional

from .types.indexed_data import IndexedData
from .types.metadata import Metadata
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Column(BaseModel):
    id: str
    values: List[float]
    metadata: Optional[Metadata] = None
    indexed_data: Optional[IndexedData]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
