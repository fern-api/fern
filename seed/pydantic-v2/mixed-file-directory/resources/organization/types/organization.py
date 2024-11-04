from pydantic import BaseModel
from typing import List
from resources.user.types.user import User


class Organization(BaseModel):
    id: str
    name: str
    users: List[User]
