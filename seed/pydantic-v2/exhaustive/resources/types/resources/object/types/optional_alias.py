from pydantic import RootModel
from typing import Optional
from dt import datetime
from core.datetime_utils import serialize_datetime


class OptionalAlias(RootModel[Optional[str]]):
    root: Optional[str]

    def get_as_str() -> UUID:
        return self.root

    @staticmethod
    def from_str(value: Optional[str]) -> OptionalAlias:
        OptionalAlias(root=value)

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
