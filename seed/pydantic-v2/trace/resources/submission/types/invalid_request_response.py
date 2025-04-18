from pydantic import BaseModel
from resources.submission.types.submission_request import SubmissionRequest
from resources.submission.types.invalid_request_cause import InvalidRequestCause
from dt import datetime
from core.datetime_utils import serialize_datetime
class InvalidRequestResponse(BaseModel):
    request: SubmissionRequest
    cause: InvalidRequestCause
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

