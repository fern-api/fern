from pydantic import BaseModel
from typing import List
from resources.user.types import User


class Organization(BaseModel):
    id: str
    name: str
    users: List[User]
