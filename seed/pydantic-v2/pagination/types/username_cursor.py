from pydantic import BaseModel
from .types.username_page import UsernamePage


class UsernameCursor(BaseModel):
    cursor: UsernamePage
