from pydantic import BaseModel
from resources.service.types.user import User


class NestedUser(BaseModel):
    name: str = Field(alias="Name")
    nested_user: User = Field(alias="NestedUser")
