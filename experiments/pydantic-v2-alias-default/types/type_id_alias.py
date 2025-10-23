from pydantic import RootModel
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime

class TypeIdAlias(RootModel[str]):
    """An alias of TypeId (tests nested alias resolution)."""
    root: str
    def get_as_type_id() -> UUID:
        return self.root
    @staticmethod
    def from_type_id(value: str) -> TypeIdAlias:
        TypeIdAlias(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

