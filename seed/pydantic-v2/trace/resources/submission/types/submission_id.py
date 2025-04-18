from pydantic import RootModel
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime
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

