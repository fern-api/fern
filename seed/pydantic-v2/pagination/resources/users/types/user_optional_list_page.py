from pydantic import BaseModel
from resources.users.types.user_optional_list_container import UserOptionalListContainer
from typing import Optional
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime


class UserOptionalListPage(BaseModel):
    data: UserOptionalListContainer
    next: Optional[UUID] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
