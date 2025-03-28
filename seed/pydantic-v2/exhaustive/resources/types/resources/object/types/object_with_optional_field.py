from datetime import datetime
from typing import Dict, List, Optional, Set
from uuid import UUID

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class ObjectWithOptionalField(BaseModel):
    string: Optional[str] = None
    """
    This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    """
    integer: Optional[int] = None
    long_: Optional[int]
    double: Optional[float] = None
    bool_: Optional[bool]
    datetime: Optional[datetime] = None
    date: Optional[str] = None
    uuid_: Optional[UUID]
    base_64: Optional[bytes]
    list_: Optional[List[str]]
    set_: Optional[Set[str]]
    map_: Optional[Dict[int, str]]
    bigint: Optional[str] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
