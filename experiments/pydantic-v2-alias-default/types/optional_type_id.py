from pydantic import RootModel
from typing import Optional
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime

class OptionalTypeId(RootModel[Optional[str]]):
    """An optional TypeId (tests alias wrapping optional)."""
    root: Optional[str]
    def get_as_type_id() -> UUID:
        return self.root
    @staticmethod
    def from_type_id(value: Optional[str]) -> OptionalTypeId:
        OptionalTypeId(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

