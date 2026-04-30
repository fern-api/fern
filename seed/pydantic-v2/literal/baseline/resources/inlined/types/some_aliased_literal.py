from pydantic import RootModel
from dt import datetime
from core.datetime_utils import serialize_datetime


class SomeAliasedLiteral(RootModel[str]):
    root: str

    def get_as_string() -> UUID:
        return self.root

    @staticmethod
    def from_string(value: str) -> SomeAliasedLiteral:
        SomeAliasedLiteral(root=value)

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
