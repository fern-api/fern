import typing

import pydantic
import typing_extensions

from ..commons.language import Language
from .submission_type_state import SubmissionTypeState


class GetSubmissionStateResponse(pydantic.BaseModel):
    time_submitted: typing.Optional[str] = pydantic.Field(alias="timeSubmitted")
    submission: str
    language: Language
    submission_type_state: SubmissionTypeState = pydantic.Field(alias="submissionTypeState")

    @pydantic.validator("time_submitted")
    def _validate_time_submitted(cls, time_submitted: typing.Optional[str]) -> typing.Optional[str]:
        for validator in GetSubmissionStateResponse.Validators._time_submitted:
            time_submitted = validator(time_submitted)
        return time_submitted

    @pydantic.validator("submission")
    def _validate_submission(cls, submission: str) -> str:
        for validator in GetSubmissionStateResponse.Validators._submission:
            submission = validator(submission)
        return submission

    @pydantic.validator("language")
    def _validate_language(cls, language: Language) -> Language:
        for validator in GetSubmissionStateResponse.Validators._language:
            language = validator(language)
        return language

    @pydantic.validator("submission_type_state")
    def _validate_submission_type_state(cls, submission_type_state: SubmissionTypeState) -> SubmissionTypeState:
        for validator in GetSubmissionStateResponse.Validators._submission_type_state:
            submission_type_state = validator(submission_type_state)
        return submission_type_state

    class Validators:
        _time_submitted: typing.ClassVar[typing.Optional[str]] = []
        _submission: typing.ClassVar[str] = []
        _language: typing.ClassVar[Language] = []
        _submission_type_state: typing.ClassVar[SubmissionTypeState] = []

        @typing.overload
        @classmethod
        def field(time_submitted: typing_extensions.Literal["time_submitted"]) -> typing.Optional[str]:
            ...

        @typing.overload
        @classmethod
        def field(submission: typing_extensions.Literal["submission"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(language: typing_extensions.Literal["language"]) -> Language:
            ...

        @typing.overload
        @classmethod
        def field(submission_type_state: typing_extensions.Literal["submission_type_state"]) -> SubmissionTypeState:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "time_submitted":
                    cls._time_submitted.append(validator)  # type: ignore
                elif field_name == "submission":
                    cls._submission.append(validator)  # type: ignore
                elif field_name == "language":
                    cls._language.append(validator)  # type: ignore
                elif field_name == "submission_type_state":
                    cls._submission_type_state.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on GetSubmissionStateResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
