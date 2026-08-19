from pydantic import BaseModel
from typing import Optional, List
from resources.users.types.page import Page
from resources.users.types.user import User
from dt import datetime
from core.datetime_utils import serialize_datetime


class ListUsersPaginationResponse(BaseModel):
    has_next_page: Optional[bool]
    page: Optional[Page] = None
    total_count: int
    """
    The totall number of /users
    """
    data: List[User]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
