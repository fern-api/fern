from pydantic import RootModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class SmallInteger(RootModel[int]):
    root: int
    def get_as_int() -> UUID:
        return self.root
    @staticmethod
    def from_int(value: int) -> SmallInteger:
        SmallInteger(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

