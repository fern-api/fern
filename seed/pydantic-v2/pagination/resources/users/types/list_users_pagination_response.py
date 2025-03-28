from typing import List, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.users.types.page import Page
from resources.users.types.user import User

from pydantic import BaseModel


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
