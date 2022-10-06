import typing

import pydantic
import typing_extensions

from .submission_id import SubmissionId


class StderrResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    stderr: str

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in StderrResponse.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("stderr")
    def _validate_stderr(cls, stderr: str) -> str:
        for validator in StderrResponse.Validators._stderr:
            stderr = validator(stderr)
        return stderr

    class Validators:
        _submission_id: typing.ClassVar[SubmissionId] = []
        _stderr: typing.ClassVar[str] = []

        @typing.overload
        @classmethod
        def field(submission_id: typing_extensions.Literal["submission_id"]) -> SubmissionId:
            ...

        @typing.overload
        @classmethod
        def field(stderr: typing_extensions.Literal["stderr"]) -> str:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)  # type: ignore
                elif field_name == "stderr":
                    cls._stderr.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on StderrResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
