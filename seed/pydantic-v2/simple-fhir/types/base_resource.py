from pydantic import BaseModel
from typing import List
from .types import ResourceList, Memo


class BaseResource(BaseModel):
    id: str
    related_resources: List[ResourceList]
    memo: Memo
