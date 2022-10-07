import typing

import pydantic
import typing_extensions

from .submission_id import SubmissionId


class RecordedResponseNotification(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    trace_responses_size: int = pydantic.Field(alias="traceResponsesSize")
    test_case_id: typing.Optional[str] = pydantic.Field(alias="testCaseId")

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in RecordedResponseNotification.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("trace_responses_size")
    def _validate_trace_responses_size(cls, trace_responses_size: int) -> int:
        for validator in RecordedResponseNotification.Validators._trace_responses_size:
            trace_responses_size = validator(trace_responses_size)
        return trace_responses_size

    @pydantic.validator("test_case_id")
    def _validate_test_case_id(cls, test_case_id: typing.Optional[str]) -> typing.Optional[str]:
        for validator in RecordedResponseNotification.Validators._test_case_id:
            test_case_id = validator(test_case_id)
        return test_case_id

    class Validators:
        _submission_id: typing.ClassVar[typing.List[typing.Callable[[SubmissionId], SubmissionId]]] = []
        _trace_responses_size: typing.ClassVar[typing.List[typing.Callable[[int], int]]] = []
        _test_case_id: typing.ClassVar[typing.List[typing.Callable[[typing.Optional[str]], typing.Optional[str]]]] = []

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
            cls, field_name: typing_extensions.Literal["trace_responses_size"]
        ) -> typing.Callable[[typing.Callable[[int], int]], typing.Callable[[int], int]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["test_case_id"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[str]], typing.Optional[str]]],
            typing.Callable[[typing.Optional[str]], typing.Optional[str]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)
                elif field_name == "trace_responses_size":
                    cls._trace_responses_size.append(validator)
                elif field_name == "test_case_id":
                    cls._test_case_id.append(validator)
                else:
                    raise RuntimeError("Field does not exist on RecordedResponseNotification: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
