from pydantic import BaseModel
from typing import List
from .types.resource_list import ResourceList
from .types.memo import Memo


class BaseResource(BaseModel):
    id: str
    related_resources: List[ResourceList]
    memo: Memo
