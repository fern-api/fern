from pydantic import BaseModel

"""A simple type with just a name."""


class Type(BaseModel):
    id: str
    name: str
