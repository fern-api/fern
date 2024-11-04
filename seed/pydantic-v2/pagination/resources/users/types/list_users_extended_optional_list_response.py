from pydantic import BaseModel
from resources.users.types.user_optional_list_page import UserOptionalListPage


class ListUsersExtendedOptionalListResponse(BaseModel, UserOptionalListPage):
    total_count: int
    """
    The totall number of /users
    """
