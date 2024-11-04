from pydantic import BaseModel
from resources.service.types import User


class NestedUser(BaseModel):
    name: str
    nested_user: User
