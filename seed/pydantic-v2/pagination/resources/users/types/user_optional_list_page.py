from typing import Optional
from uuid import UUID

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.users.types.user_optional_list_container import UserOptionalListContainer

from pydantic import BaseModel


class UserOptionalListPage(BaseModel):
    data: UserOptionalListContainer
    next: Optional[UUID] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
