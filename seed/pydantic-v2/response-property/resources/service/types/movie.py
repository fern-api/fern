from pydantic import BaseModel


class Movie(BaseModel):
    id: str
    name: str
