from pydantic import BaseModel
from typing import Optional, List
from .types.scored_column import ScoredColumn


class QueryResult(BaseModel):
    matches: Optional[List[ScoredColumn]] = None
    namespace: Optional[str] = None
