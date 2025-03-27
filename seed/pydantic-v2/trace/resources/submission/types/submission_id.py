from uuid import UUID

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import RootModel


class SubmissionId(RootModel[UUID]):
    root: UUID

    def get_as_uuid() -> UUID:
        return self.root

    @staticmethod
    def from_uuid(value: UUID) -> SubmissionId:
        SubmissionId(root=value)

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
