from pydantic import BaseModel
from resources.submission.types.submission_request import SubmissionRequest
from resources.submission.types.invalid_request_cause import InvalidRequestCause


class InvalidRequestResponse(BaseModel):
    request: SubmissionRequest
    cause: InvalidRequestCause
