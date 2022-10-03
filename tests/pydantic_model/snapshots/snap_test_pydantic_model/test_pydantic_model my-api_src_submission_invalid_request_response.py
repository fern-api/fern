import typing

import pydantic

from .invalid_request_cause import InvalidRequestCause
from .submission_request import SubmissionRequest


class InvalidRequestResponse(pydantic.BaseModel):
    request: SubmissionRequest
    cause: InvalidRequestCause

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
