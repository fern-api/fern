from pydantic import BaseModel
from typing import List, Optional
from .types import Metadata, IndexedData


class Column(BaseModel):
    id: str
    values: List[float]
    metadata: Optional[Metadata] = None
    indexed_data: Optional[IndexedData] = None
