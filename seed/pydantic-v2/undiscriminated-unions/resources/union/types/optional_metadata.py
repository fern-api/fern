from pydantic import RootModel
from typing import Optional, Dict, Any
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime

class OptionalMetadata(RootModel[Optional[Dict[str, Any]]]):
    root: Optional[Dict[str, Any]]
    def get_as_map() -> UUID:
        return self.root
    @staticmethod
    def from_map(value: Optional[Dict[str, Any]]) -> OptionalMetadata:
        OptionalMetadata(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

