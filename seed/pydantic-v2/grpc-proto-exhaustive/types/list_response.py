from pydantic import BaseModel
from typing import Optional, List
from .types.list_element import ListElement
from .types.pagination import Pagination
from .types.usage import Usage
from dt import datetime
from core.datetime_utils import serialize_datetime


class ListResponse(BaseModel):
    columns: Optional[List[ListElement]] = None
    pagination: Optional[Pagination] = None
    namespace: Optional[str] = None
    usage: Optional[Usage] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
