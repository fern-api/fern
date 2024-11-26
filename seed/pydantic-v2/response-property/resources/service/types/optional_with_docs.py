from pydantic import RootModel
from typing import Optional
from resources.service.types.with_docs import WithDocs
from dt import datetime
from core.datetime_utils import serialize_datetime


class OptionalWithDocs(RootModel[Optional[WithDocs]]):
    root: Optional[WithDocs]

    def get_as_with_docs() -> UUID:
        return self.root

    @staticmethod
    def from_with_docs(value: Optional[WithDocs]) -> OptionalWithDocs:
        OptionalWithDocs(root=value)

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
