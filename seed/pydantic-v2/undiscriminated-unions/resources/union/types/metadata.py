from pydantic import RootModel
from typing import Dict
from resources.union.types.key import Key
from dt import datetime
from core.datetime_utils import serialize_datetime
class Metadata(RootModel[Dict[Key, str]]):
"""Undiscriminated unions can act as a map key
as long as all of their values are valid keys
(i.e. do they have a valid string representation)."""
    root: Dict[Key, str]
    def get_as_map() -> UUID:
        return self.root
    @staticmethod
    def from_map(value: Dict[Key, str]) -> Metadata:
        Metadata(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

