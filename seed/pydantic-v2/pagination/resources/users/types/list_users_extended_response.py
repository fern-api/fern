from pydantic import BaseModel
from resources.users.types.user_page import UserPage


class ListUsersExtendedResponse(BaseModel, UserPage):
    total_count: int
    """
    The totall number of /users
    """
