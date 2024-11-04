from pydantic import BaseModel
from resources.user.types.user import User


class NestedUser(BaseModel):
    name: str
    user: User
