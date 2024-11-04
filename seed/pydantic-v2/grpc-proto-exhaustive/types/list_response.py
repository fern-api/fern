from pydantic import BaseModel
from typing import Optional, List
from .types import ListElement, Pagination, Usage


class ListResponse(BaseModel):
    columns: Optional[List[ListElement]] = None
    pagination: Optional[Pagination] = None
    namespace: Optional[str] = None
    usage: Optional[Usage] = None
