from pydantic import BaseModel
from typing import Optional, List, Set, Dict
from datetime import datetime
from uuid import UUID


class ObjectWithOptionalField(BaseModel):
    string: Optional[str] = None
    integer: Optional[int] = None
    long_: Optional[int] = None
    double: Optional[float] = None
    bool_: Optional[bool] = None
    datetime: Optional[datetime] = None
    date: Optional[str] = None
    uuid_: Optional[UUID] = None
    base_64: Optional[bytes] = None
    list_: Optional[List[str]] = None
    set_: Optional[Set[str]] = None
    map_: Optional[Dict[int, str]] = None
    bigint: Optional[str] = None
