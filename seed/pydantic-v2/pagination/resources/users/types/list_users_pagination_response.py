from pydantic import BaseModel
from typing import Optional, List
from resources.users.types.page import Page
from resources.users.types.user import User


class ListUsersPaginationResponse(BaseModel):
    has_next_page: Optional[bool] = Field(alias="hasNextPage", default=None)
    page: Optional[Page] = None
    total_count: int
    """
    The totall number of /users
    """
    data: List[User]
