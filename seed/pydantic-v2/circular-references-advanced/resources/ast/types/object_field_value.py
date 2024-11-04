from pydantic import BaseModel
from resources.ast.types.field_value import FieldValue

"""This type allows us to test a circular reference with a union type (see FieldValue)."""


class ObjectFieldValue(BaseModel):
    name: str
    value: FieldValue
