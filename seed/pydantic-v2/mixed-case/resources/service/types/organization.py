from pydantic import BaseModel


class Organization(BaseModel):
    name: str
