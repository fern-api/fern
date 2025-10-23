from pydantic import RootModel
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime

class TypeId(RootModel[str]):
    """An alias for type IDs."""
    root: str
    def get_as_str() -> UUID:
        return self.root
    @staticmethod
    def from_str(value: str) -> TypeId:
        TypeId(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

