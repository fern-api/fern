from pydantic import RootModel
from typing import Dict
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime

class NestedTypeIdMap(RootModel[Dict[str, Dict[str, str]]]):
    """A nested map structure with wrapped alias keys."""
    root: Dict[str, Dict[str, str]]
    def get_as_map() -> UUID:
        return self.root
    @staticmethod
    def from_map(value: Dict[str, Dict[str, str]]) -> NestedTypeIdMap:
        NestedTypeIdMap(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

