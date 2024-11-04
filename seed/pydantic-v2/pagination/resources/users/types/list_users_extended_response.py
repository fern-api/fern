from pydantic import BaseModel
from resources.users.types.user_page import UserPage
from dt import datetime
from core.datetime_utils import serialize_datetime


class ListUsersExtendedResponse(BaseModel, UserPage):
    total_count: int
    """
    The totall number of /users
    """

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
