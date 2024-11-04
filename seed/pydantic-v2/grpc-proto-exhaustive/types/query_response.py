from pydantic import BaseModel
from typing import Optional, List
from .types.query_result import QueryResult
from .types.scored_column import ScoredColumn
from .types.usage import Usage


class QueryResponse(BaseModel):
    results: Optional[List[QueryResult]] = None
    matches: Optional[List[ScoredColumn]] = None
    namespace: Optional[str] = None
    usage: Optional[Usage] = None
