from pydantic import BaseModel


class Name(BaseModel):
    id: str
    value: str
