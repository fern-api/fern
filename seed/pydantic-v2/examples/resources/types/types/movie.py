from typing import Any, Dict, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Movie(BaseModel):
    id: str
    prequel: Optional[str] = None
    title: str
    from_: str
    rating: float
    """
    The rating scale is one to five stars
    """
    type: str
    tag: str
    book: Optional[str] = None
    metadata: Dict[str, Any]
    revenue: int

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
