from pydantic import BaseModel
from typing import List, Optional
from .types.metadata import Metadata
from .types.indexed_data import IndexedData


class Column(BaseModel):
    id: str
    values: List[float]
    metadata: Optional[Metadata] = None
    indexed_data: Optional[IndexedData] = Field(alias="indexedData", default=None)
