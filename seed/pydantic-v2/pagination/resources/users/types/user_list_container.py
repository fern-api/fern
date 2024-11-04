from pydantic import BaseModel
from typing import List
from resources.users.types import User


class UserListContainer(BaseModel):
    users: List[User]
