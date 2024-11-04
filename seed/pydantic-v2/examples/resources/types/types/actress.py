from pydantic import BaseModel


class Actress(BaseModel):
    name: str
    id: str
