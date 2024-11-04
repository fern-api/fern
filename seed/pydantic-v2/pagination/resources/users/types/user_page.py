from pydantic import BaseModel
from resources.users.types.user_list_container import UserListContainer
from typing import Optional
from uuid import UUID


class UserPage(BaseModel):
    data: UserListContainer
    next: Optional[UUID] = None
