from pydantic import BaseModel
from typing import Optional, List
from .types import QueryResult, ScoredColumn, Usage


class QueryResponse(BaseModel):
    results: Optional[List[QueryResult]] = None
    matches: Optional[List[ScoredColumn]] = None
    namespace: Optional[str] = None
    usage: Optional[Usage] = None
