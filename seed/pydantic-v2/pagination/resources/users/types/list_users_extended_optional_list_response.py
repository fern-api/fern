from pydantic import BaseModel


class ListUsersExtendedOptionalListResponse(BaseModel):
    total_count: int
