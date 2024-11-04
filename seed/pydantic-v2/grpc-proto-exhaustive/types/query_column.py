from pydantic import BaseModel
from typing import List, Optional
from .types.metadata import Metadata
from .types.indexed_data import IndexedData


class QueryColumn(BaseModel):
    values: List[float]
    top_k: Optional[int] = Field(alias="topK", default=None)
    namespace: Optional[str] = None
    filter: Optional[Metadata] = None
    indexed_data: Optional[IndexedData] = Field(alias="indexedData", default=None)
