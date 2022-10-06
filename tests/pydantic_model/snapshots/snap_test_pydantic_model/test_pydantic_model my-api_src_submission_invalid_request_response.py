import typing

import pydantic
import typing_extensions

from .invalid_request_cause import InvalidRequestCause
from .submission_request import SubmissionRequest


class InvalidRequestResponse(pydantic.BaseModel):
    request: SubmissionRequest
    cause: InvalidRequestCause

    @pydantic.validator("request")
    def _validate_request(cls, request: SubmissionRequest) -> SubmissionRequest:
        for validator in InvalidRequestResponse.Validators._request:
            request = validator(request)
        return request

    @pydantic.validator("cause")
    def _validate_cause(cls, cause: InvalidRequestCause) -> InvalidRequestCause:
        for validator in InvalidRequestResponse.Validators._cause:
            cause = validator(cause)
        return cause

    class Validators:
        _request: typing.ClassVar[SubmissionRequest] = []
        _cause: typing.ClassVar[InvalidRequestCause] = []

        @typing.overload
        @classmethod
        def field(request: typing_extensions.Literal["request"]) -> SubmissionRequest:
            ...

        @typing.overload
        @classmethod
        def field(cause: typing_extensions.Literal["cause"]) -> InvalidRequestCause:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "request":
                    cls._request.append(validator)  # type: ignore
                elif field_name == "cause":
                    cls._cause.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on InvalidRequestResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
