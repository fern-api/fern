from pydantic import RootModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class Double(RootModel[float]):
    root: float
    def get_as_float() -> UUID:
        return self.root
    @staticmethod
    def from_float(value: float) -> Double:
        Double(root=value)
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

