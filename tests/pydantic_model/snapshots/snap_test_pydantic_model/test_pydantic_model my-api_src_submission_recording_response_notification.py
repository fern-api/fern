import typing

import pydantic
import typing_extensions

from .lightweight_stackframe_information import LightweightStackframeInformation
from .submission_id import SubmissionId
from .traced_file import TracedFile


class RecordingResponseNotification(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    test_case_id: typing.Optional[str] = pydantic.Field(alias="testCaseId")
    line_number: int = pydantic.Field(alias="lineNumber")
    lightweight_stack_info: LightweightStackframeInformation = pydantic.Field(alias="lightweightStackInfo")
    traced_file: typing.Optional[TracedFile] = pydantic.Field(alias="tracedFile")

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in RecordingResponseNotification.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("test_case_id")
    def _validate_test_case_id(cls, test_case_id: typing.Optional[str]) -> typing.Optional[str]:
        for validator in RecordingResponseNotification.Validators._test_case_id:
            test_case_id = validator(test_case_id)
        return test_case_id

    @pydantic.validator("line_number")
    def _validate_line_number(cls, line_number: int) -> int:
        for validator in RecordingResponseNotification.Validators._line_number:
            line_number = validator(line_number)
        return line_number

    @pydantic.validator("lightweight_stack_info")
    def _validate_lightweight_stack_info(
        cls, lightweight_stack_info: LightweightStackframeInformation
    ) -> LightweightStackframeInformation:
        for validator in RecordingResponseNotification.Validators._lightweight_stack_info:
            lightweight_stack_info = validator(lightweight_stack_info)
        return lightweight_stack_info

    @pydantic.validator("traced_file")
    def _validate_traced_file(cls, traced_file: typing.Optional[TracedFile]) -> typing.Optional[TracedFile]:
        for validator in RecordingResponseNotification.Validators._traced_file:
            traced_file = validator(traced_file)
        return traced_file

    class Validators:
        _submission_id: typing.ClassVar[SubmissionId] = []
        _test_case_id: typing.ClassVar[typing.Optional[str]] = []
        _line_number: typing.ClassVar[int] = []
        _lightweight_stack_info: typing.ClassVar[LightweightStackframeInformation] = []
        _traced_file: typing.ClassVar[typing.Optional[TracedFile]] = []

        @typing.overload
        @classmethod
        def field(submission_id: typing_extensions.Literal["submission_id"]) -> SubmissionId:
            ...

        @typing.overload
        @classmethod
        def field(test_case_id: typing_extensions.Literal["test_case_id"]) -> typing.Optional[str]:
            ...

        @typing.overload
        @classmethod
        def field(line_number: typing_extensions.Literal["line_number"]) -> int:
            ...

        @typing.overload
        @classmethod
        def field(
            lightweight_stack_info: typing_extensions.Literal["lightweight_stack_info"],
        ) -> LightweightStackframeInformation:
            ...

        @typing.overload
        @classmethod
        def field(traced_file: typing_extensions.Literal["traced_file"]) -> typing.Optional[TracedFile]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)  # type: ignore
                elif field_name == "test_case_id":
                    cls._test_case_id.append(validator)  # type: ignore
                elif field_name == "line_number":
                    cls._line_number.append(validator)  # type: ignore
                elif field_name == "lightweight_stack_info":
                    cls._lightweight_stack_info.append(validator)  # type: ignore
                elif field_name == "traced_file":
                    cls._traced_file.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on RecordingResponseNotification: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
