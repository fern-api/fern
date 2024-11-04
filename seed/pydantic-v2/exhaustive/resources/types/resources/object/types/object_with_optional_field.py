from pydantic import BaseModel
from typing import Optional, List, Set, Dict
from datetime import datetime
from uuid import UUID


class ObjectWithOptionalField(BaseModel):
    string: Optional[str] = None
    """
    This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    """
    integer: Optional[int] = None
    long_: Optional[int] = Field(alias="long", default=None)
    double: Optional[float] = None
    bool_: Optional[bool] = Field(alias="bool", default=None)
    datetime: Optional[datetime] = None
    date: Optional[str] = None
    uuid_: Optional[UUID] = Field(alias="uuid", default=None)
    base_64: Optional[bytes] = Field(alias="base64", default=None)
    list_: Optional[List[str]] = Field(alias="list", default=None)
    set_: Optional[Set[str]] = Field(alias="set", default=None)
    map_: Optional[Dict[int, str]] = Field(alias="map", default=None)
    bigint: Optional[str] = None
