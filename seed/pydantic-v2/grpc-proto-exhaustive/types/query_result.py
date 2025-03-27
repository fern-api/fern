from typing import List, Optional

from .types.scored_column import ScoredColumn
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class QueryResult(BaseModel):
    matches: Optional[List[ScoredColumn]] = None
    namespace: Optional[str] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
