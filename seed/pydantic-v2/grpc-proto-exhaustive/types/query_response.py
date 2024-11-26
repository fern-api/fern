from pydantic import BaseModel
from typing import Optional, List
from .types.query_result import QueryResult
from .types.scored_column import ScoredColumn
from .types.usage import Usage
from dt import datetime
from core.datetime_utils import serialize_datetime


class QueryResponse(BaseModel):
    results: Optional[List[QueryResult]] = None
    matches: Optional[List[ScoredColumn]] = None
    namespace: Optional[str] = None
    usage: Optional[Usage] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
