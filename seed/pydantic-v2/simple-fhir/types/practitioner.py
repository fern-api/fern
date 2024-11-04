from pydantic import BaseModel


class Practitioner(BaseModel):
    resource_type: str
    name: str
