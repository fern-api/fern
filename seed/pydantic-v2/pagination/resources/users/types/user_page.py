from typing import Optional
from uuid import UUID

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.users.types.user_list_container import UserListContainer

from pydantic import BaseModel


class UserPage(BaseModel):
    data: UserListContainer
    next: Optional[UUID] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
