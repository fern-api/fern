from pydantic import RootModel
from typing import Any
from dt import datetime
from core.datetime_utils import serialize_datetime


class MyAlias(RootModel[Any]):
    root: Any

    def get_value() -> UUID:
        return self.root

    @staticmethod
    def from_value(value: Any) -> MyAlias:
        MyAlias(root=value)

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
