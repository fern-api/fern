from pydantic import BaseModel
from typing import Optional, List
from .types.list_element import ListElement
from .types.pagination import Pagination
from .types.usage import Usage


class ListResponse(BaseModel):
    columns: Optional[List[ListElement]] = None
    pagination: Optional[Pagination] = None
    namespace: Optional[str] = None
    usage: Optional[Usage] = None
