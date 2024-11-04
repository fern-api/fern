from pydantic import BaseModel
from typing import List


class IndexedData(BaseModel):
    indices: List[int]
    values: List[float]
