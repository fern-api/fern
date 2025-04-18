from pydantic import BaseModel
from typing import Optional, List
from .types.scored_column import ScoredColumn
from dt import datetime
from core.datetime_utils import serialize_datetime


class QueryResult(BaseModel):
    matches: Optional[List[ScoredColumn]] = None
    namespace: Optional[str] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
