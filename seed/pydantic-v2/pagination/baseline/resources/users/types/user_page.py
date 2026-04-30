from pydantic import BaseModel
from resources.users.types.user_list_container import UserListContainer
from typing import Optional
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime


class UserPage(BaseModel):
    data: UserListContainer
    next: Optional[UUID] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
