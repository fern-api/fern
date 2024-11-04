from pydantic import BaseModel
from typing import Optional, List
from .types.metadata import Metadata
from .types.indexed_data import IndexedData


class ScoredColumn(BaseModel):
    id: str
    score: Optional[float] = None
    values: Optional[List[float]] = None
    metadata: Optional[Metadata] = None
    indexed_data: Optional[IndexedData] = Field(alias="indexedData", default=None)
