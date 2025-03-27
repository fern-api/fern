from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.submission.types.invalid_request_cause import InvalidRequestCause
from resources.submission.types.submission_request import SubmissionRequest

from pydantic import BaseModel


class InvalidRequestResponse(BaseModel):
    request: SubmissionRequest
    cause: InvalidRequestCause

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
