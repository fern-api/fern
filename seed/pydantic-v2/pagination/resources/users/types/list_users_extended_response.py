from pydantic import BaseModel


class ListUsersExtendedResponse(BaseModel):
    total_count: int
