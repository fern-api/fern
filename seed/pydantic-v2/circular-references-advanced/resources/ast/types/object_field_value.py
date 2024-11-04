from pydantic import BaseModel
from resources.ast.types import FieldValue


class ObjectFieldValue(BaseModel):
    name: str
    value: FieldValue
