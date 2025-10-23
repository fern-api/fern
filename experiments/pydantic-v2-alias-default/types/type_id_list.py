from pydantic import RootModel
from typing import List
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime

class TypeIdList(RootModel[List[str]]):
    """A list of TypeIds (tests alias in list items)."""
    root: List[str]
    def get_as_list() -> UUID:
        return self.root
    @staticmethod
    def from_list(value: List[str]) -> TypeIdList:
        TypeIdList(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

