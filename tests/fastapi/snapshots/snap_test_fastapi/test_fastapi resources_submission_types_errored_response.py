import typing

import pydantic
import typing_extensions

from .error_info import ErrorInfo
from .submission_id import SubmissionId


class ErroredResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    error_info: ErrorInfo = pydantic.Field(alias="errorInfo")

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in ErroredResponse.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("error_info")
    def _validate_error_info(cls, error_info: ErrorInfo) -> ErrorInfo:
        for validator in ErroredResponse.Validators._error_info:
            error_info = validator(error_info)
        return error_info

    class Validators:
        _submission_id: typing.ClassVar[typing.List[typing.Callable[[SubmissionId], SubmissionId]]] = []
        _error_info: typing.ClassVar[typing.List[typing.Callable[[ErrorInfo], ErrorInfo]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["submission_id"]
        ) -> typing.Callable[
            [typing.Callable[[SubmissionId], SubmissionId]], typing.Callable[[SubmissionId], SubmissionId]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["error_info"]
        ) -> typing.Callable[[typing.Callable[[ErrorInfo], ErrorInfo]], typing.Callable[[ErrorInfo], ErrorInfo]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)
                elif field_name == "error_info":
                    cls._error_info.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ErroredResponse: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
