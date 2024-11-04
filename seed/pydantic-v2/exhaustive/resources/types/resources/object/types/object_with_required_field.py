from pydantic import BaseModel


class ObjectWithRequiredField(BaseModel):
    string: str
