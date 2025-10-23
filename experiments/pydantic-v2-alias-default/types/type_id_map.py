from pydantic import RootModel
from typing import Dict
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime

class TypeIdMap(RootModel[Dict[str, str]]):
    """A map using TypeId (wrapped alias) as keys."""
    root: Dict[str, str]
    def get_as_map() -> UUID:
        return self.root
    @staticmethod
    def from_map(value: Dict[str, str]) -> TypeIdMap:
        TypeIdMap(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

