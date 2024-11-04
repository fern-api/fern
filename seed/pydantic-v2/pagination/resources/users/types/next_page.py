from pydantic import BaseModel


class NextPage(BaseModel):
    page: int
    starting_after: str
