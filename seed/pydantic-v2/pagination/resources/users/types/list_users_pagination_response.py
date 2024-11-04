from pydantic import BaseModel
from typing import Optional, List
from resources.users.types import Page, User


class ListUsersPaginationResponse(BaseModel):
    has_next_page: Optional[bool] = None
    page: Optional[Page] = None
    total_count: int
    data: List[User]
