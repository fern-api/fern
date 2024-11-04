from pydantic import BaseModel


class Actor(BaseModel):
    name: str
    id: str
