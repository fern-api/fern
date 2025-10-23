from pydantic import RootModel
from .type import Type
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime

class Object(RootModel[Type]):
    """Object is an alias for a type."""
    root: Type
    def get_as_type() -> UUID:
        return self.root
    @staticmethod
    def from_type(value: Type) -> Object:
        Object(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

