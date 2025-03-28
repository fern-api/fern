from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.users.types.user_optional_list_page import UserOptionalListPage

from pydantic import BaseModel


class ListUsersExtendedOptionalListResponse(BaseModel, UserOptionalListPage):
    total_count: int
    """
    The totall number of /users
    """

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
