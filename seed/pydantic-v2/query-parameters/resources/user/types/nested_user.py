from pydantic import BaseModel
from resources.user.types import User


class NestedUser(BaseModel):
    name: str
    user: User
