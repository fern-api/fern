from pydantic import BaseModel
from typing import Optional, List
from .types import Metadata, IndexedData


class ScoredColumn(BaseModel):
    id: str
    score: Optional[float] = None
    values: Optional[List[float]] = None
    metadata: Optional[Metadata] = None
    indexed_data: Optional[IndexedData] = None
