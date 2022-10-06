import typing

import pydantic
import typing_extensions

from .running_submission_state import RunningSubmissionState
from .submission_id import SubmissionId


class RunningResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    state: RunningSubmissionState

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in RunningResponse.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("state")
    def _validate_state(cls, state: RunningSubmissionState) -> RunningSubmissionState:
        for validator in RunningResponse.Validators._state:
            state = validator(state)
        return state

    class Validators:
        _submission_id: typing.ClassVar[SubmissionId] = []
        _state: typing.ClassVar[RunningSubmissionState] = []

        @typing.overload
        @classmethod
        def field(submission_id: typing_extensions.Literal["submission_id"]) -> SubmissionId:
            ...

        @typing.overload
        @classmethod
        def field(state: typing_extensions.Literal["state"]) -> RunningSubmissionState:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)  # type: ignore
                elif field_name == "state":
                    cls._state.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on RunningResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
