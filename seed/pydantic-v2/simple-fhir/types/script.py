from pydantic import BaseModel


class Script(BaseModel):
    resource_type: str
    name: str
