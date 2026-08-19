from pydantic import RootModel
from typing import Optional
from .types.string_response import StringResponse
from dt import datetime
from core.datetime_utils import serialize_datetime


class OptionalStringResponse(RootModel[Optional[StringResponse]]):
    root: Optional[StringResponse]

    def get_as_string_response() -> UUID:
        return self.root

    @staticmethod
    def from_string_response(value: Optional[StringResponse]) -> OptionalStringResponse:
        OptionalStringResponse(root=value)

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
