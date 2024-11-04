from pydantic import BaseModel
from resources.submission.types import SubmissionRequest, InvalidRequestCause


class InvalidRequestResponse(BaseModel):
    request: SubmissionRequest
    cause: InvalidRequestCause
