from pydantic import BaseModel
from resources.users.types.user_optional_list_container import UserOptionalListContainer
from typing import Optional
from uuid import UUID


class UserOptionalListPage(BaseModel):
    data: UserOptionalListContainer
    next: Optional[UUID] = None
