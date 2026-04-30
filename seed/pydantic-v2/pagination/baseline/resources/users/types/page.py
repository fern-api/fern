from pydantic import BaseModel
from typing import Optional
from resources.users.types.next_page import NextPage
from dt import datetime
from core.datetime_utils import serialize_datetime


class Page(BaseModel):
    page: int
    """
    The current page
    """
    next: Optional[NextPage] = None
    per_page: int
    total_page: int

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
