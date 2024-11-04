from pydantic import BaseModel
from typing import List, Optional
from .types import Metadata, IndexedData


class QueryColumn(BaseModel):
    values: List[float]
    top_k: Optional[int] = None
    namespace: Optional[str] = None
    filter: Optional[Metadata] = None
    indexed_data: Optional[IndexedData] = None
