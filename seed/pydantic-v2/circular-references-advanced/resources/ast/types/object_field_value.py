from pydantic import BaseModel
from resources.ast.types.field_value import FieldValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class ObjectFieldValue(BaseModel):
"""This type allows us to test a circular reference with a union type (see FieldValue)."""
    name: str
    value: FieldValue
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

