from pydantic import BaseModel
from .types import UsernamePage


class UsernameCursor(BaseModel):
    cursor: UsernamePage
