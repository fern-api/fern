from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import RootModel


class Sentence(RootModel[str]):
    root: str

    def get_as_str() -> UUID:
        return self.root

    @staticmethod
    def from_str(value: str) -> Sentence:
        Sentence(root=value)

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
