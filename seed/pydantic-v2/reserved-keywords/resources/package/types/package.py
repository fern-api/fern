from pydantic import BaseModel


class Package(BaseModel):
    name: str
